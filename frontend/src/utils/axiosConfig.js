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
    if (userData?.token) {
      config.headers.Authorization = `Bearer ${userData.token}`;
    }
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
