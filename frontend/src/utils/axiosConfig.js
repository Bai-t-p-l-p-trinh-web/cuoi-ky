import axios from "axios";

// Create axios instance with default configuration
const baseServerUrl = import.meta.env.VITE_AUTH_SERVER_URL;
const apiClient = axios.create({
  baseURL: baseServerUrl,
  withCredentials: true, // Always send cookies with requests
  timeout: 10000, // 10 second timeout
});

// Helper function to get user data from localStorage
const getUserData = () => {
  const user = localStorage.getItem("user");
  if (user) {
    try {
      return JSON.parse(user);
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      localStorage.removeItem("user"); // Clear corrupted data
      return null;
    }
  }
  return null;
};

// Helper function to set access token in localStorage
const setAccessToken = (accessToken) => {
  const userData = getUserData();
  if (userData) {
    localStorage.setItem(
      "user",
      JSON.stringify({ ...userData, token: accessToken })
    );
  } else {
    console.warn(
      "Attempted to set access token, but no existing user data found. Storing token directly."
    );
    localStorage.setItem("user", JSON.stringify({ token: accessToken }));
  }
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const userData = getUserData();
    let token = userData?.token;

    // Fallback: check if token is stored directly in localStorage
    if (!token) {
      token = localStorage.getItem("token");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("Request config:", {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
    });

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await apiClient.post("/auth/refresh-token");
        const newAccessToken = data.data.accessToken;
        setAccessToken(newAccessToken);

        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("user");

        // Redirect to login - server sẽ tự động invalidate refresh token khi hết hạn
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// API ENDPOINTS - Centralized API calls

// Order APIs
export const orderAPI = {
  create: (data) => apiClient.post("/orders", data),
  list: (params) => apiClient.get("/orders", { params }),
  getAllOrders: (params) => apiClient.get("/orders", { params }),
  getDetail: (id) => apiClient.get(`/orders/${id}`),
  confirmPayment: (data) => apiClient.post("/orders/confirm-payment", data),
  downloadContract: (id) => apiClient.get(`/orders/${id}/contract`),
  regenerateContract: (id) =>
    apiClient.post(`/orders/${id}/regenerate-contract`),
  updateStatus: (id, data) => apiClient.patch(`/orders/${id}/status`, data),
  cancelOrder: (id, data) => apiClient.patch(`/orders/${id}/cancel`, data),
  confirmDelivery: (id, data) =>
    apiClient.patch(`/orders/${id}/confirm-delivery`, data),
};

// Payment APIs (Admin)
export const paymentAPI = {
  getPending: (params) => apiClient.get("/payment/pending", { params }),
  verify: (id, data) => apiClient.patch(`/payment/${id}/verify`, data),
  reject: (id, data) => apiClient.patch(`/payment/${id}/reject`, data),
  getDetail: (id) => apiClient.get(`/payment/${id}`),
};

// Refund APIs
export const refundAPI = {
  create: (data) => apiClient.post("/refunds", data),
  list: (params) => apiClient.get("/refunds", { params }),
  getDetail: (id) => apiClient.get(`/refunds/${id}`),
  approve: (id, data) => apiClient.patch(`/refunds/${id}/approve`, data),
  reject: (id, data) => apiClient.patch(`/refunds/${id}/reject`, data),
  process: (id, data) => apiClient.patch(`/refunds/${id}/process`, data),
};

// Notification APIs
export const notificationAPI = {
  list: (params) => apiClient.get("/notifications", { params }),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch("/notifications/mark-all-read"),
  delete: (id) => apiClient.delete(`/notifications/${id}`),
};

// User Bank Info APIs
export const userBankAPI = {
  get: () => apiClient.get("/user/bank-info"),
  update: (data) => apiClient.put("/user/bank-info", data),
  getPendingVerifications: () =>
    apiClient.get("/user/pending-bank-verifications"),
  verifyBankInfo: (userId, data) =>
    apiClient.put(`/user/${userId}/verify-bank-info`, data),
};

// Admin Dashboard APIs
export const adminAPI = {
  getDashboardStats: () => apiClient.get("/admin/dashboard/stats"),
  getAnalytics: (period = "30d") =>
    apiClient.get(`/admin/dashboard/analytics?period=${period}`),

  // User management
  getUsers: (params) => apiClient.get("/admin/users", { params }),
  getUserDetail: (id) => apiClient.get(`/admin/users/${id}`),
  updateUser: (id, data) => apiClient.put(`/admin/users/${id}`, data),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
  updateUserStatus: (id, data) =>
    apiClient.put(`/admin/users/${id}/status`, data),
  changeRoleUser: (slugUser, data) => apiClient.patch(`/user/${slugUser}`, data),

  // Car management
  getCars: (params) => apiClient.get("/admin/cars", { params }),
  getCarDetail: (id) => apiClient.get(`/admin/cars/${id}`),
  updateCarStatus: (id, data) =>
    apiClient.put(`/admin/cars/${id}/status`, data),
  deleteCar: (id) => apiClient.delete(`/admin/cars/${id}`),

  // Request management
  getRequests: (params) => apiClient.get("/admin/requests", { params }),
  getRequestDetail: (id) => apiClient.get(`/admin/requests/${id}`),
  approveRequest: (id, data) =>
    apiClient.put(`/admin/requests/${id}/approve`, data),
  rejectRequest: (id, data) =>
    apiClient.put(`/admin/requests/${id}/reject`, data),
  assignInspectors: (slug, data) =>
    apiClient.patch(`/requestAdd/${slug}/employee`, data),

  // Inspector management
  getInspectors: () => apiClient.get("/user/staffs"),
  // Order management
  getOrders: (params) => apiClient.get("/admin/orders", { params }),
  getOrderDetail: (id) => apiClient.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, data) =>
    apiClient.put(`/admin/orders/${id}/status`, data),

  // Payment management
  getPayments: (params) => apiClient.get("/admin/payments", { params }),
  getPaymentDetail: (id) => apiClient.get(`/admin/payments/${id}`),
  updatePaymentStatus: (id, data) =>
    apiClient.put(`/admin/payments/${id}/status`, data),

  // Refund management
  getRefunds: (params) => apiClient.get("/admin/refunds", { params }),
};
