import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaCar,
  FaShoppingCart,
  FaMoneyBillWave,
  FaUserCheck,
  FaCarSide,
  FaChartLine,
  FaExclamationTriangle,
} from "react-icons/fa";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { adminAPI } from "../../../utils/axiosConfig";
import { toast } from "react-toastify";
import "./AdminDashboard.scss";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log("Fetching admin dashboard data...");
      try {
        const [statsResponse, analyticsResponse] = await Promise.all([
          adminAPI.getDashboardStats(),
          adminAPI.getAnalytics(selectedPeriod),
        ]);

        console.log("Stats response:", statsResponse);
        console.log("Analytics response:", analyticsResponse);

        // Axios response có structure: { data: { success: true, data: {...} } }
        if (statsResponse && statsResponse.data && statsResponse.data.success) {
          console.log("Setting dashboard data:", statsResponse.data.data);
          setDashboardData(statsResponse.data.data);
        } else {
          console.warn("Stats response not successful:", statsResponse);
          // Fall back to mock data
          setDashboardData({
            overview: {
              totalUsers: 0,
              totalSellers: 0,
              totalBuyers: 0,
              totalCars: 0,
              activeCars: 0,
              soldCars: 0,
              totalOrders: 0,
              completedOrders: 0,
              pendingOrders: 0,
              totalRequests: 0,
              pendingRequests: 0,
              approvedRequests: 0,
              rejectedRequests: 0,
              totalRevenue: 0,
            },
            charts: {
              monthlyRevenue: [],
              orderStatusStats: [],
              carCategoryStats: [],
            },
            recentActivities: [],
          });
        }
        if (
          analyticsResponse &&
          analyticsResponse.data &&
          analyticsResponse.data.success
        ) {
          console.log("Setting analytics data:", analyticsResponse.data.data);
          console.log(
            "carsByStatus:",
            analyticsResponse.data.data.carsByStatus
          );
          setAnalytics(analyticsResponse.data.data);
        }

        // Debug dashboardData
        if (statsResponse && statsResponse.data && statsResponse.data.success) {
          console.log(
            "orderStatusStats:",
            statsResponse.data.data.charts?.orderStatusStats
          );
        }
      } catch (apiError) {
        console.error("API call failed:", apiError);
        toast.error("Không thể tải dữ liệu thống kê. Sử dụng dữ liệu mẫu.");

        // Use mock data when API fails
        setDashboardData({
          overview: {
            totalUsers: 0,
            totalSellers: 0,
            totalBuyers: 0,
            totalCars: 0,
            activeCars: 0,
            soldCars: 0,
            totalOrders: 0,
            completedOrders: 0,
            pendingOrders: 0,
            totalRequests: 0,
            pendingRequests: 0,
            approvedRequests: 0,
            rejectedRequests: 0,
            totalRevenue: 0,
          },
          charts: {
            monthlyRevenue: [],
            orderStatusStats: [],
            carCategoryStats: [],
          },
          recentActivities: [],
        });
      }

      setLoading(false);
    } catch (error) {
      console.error("Error in fetchDashboardData:", error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };
  // Chart data
  const revenueChartData = {
    labels:
      dashboardData?.charts?.monthlyRevenue?.map(
        (item) => `T${item.month}/${item.year}`
      ) || [],
    datasets: [
      {
        label: "Doanh thu (VNĐ)",
        data:
          dashboardData?.charts?.monthlyRevenue?.map(
            (item) => item.revenue / 1000000 // Convert to millions
          ) || [],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  };
  const orderStatusData = {
    labels:
      dashboardData?.charts?.orderStatusStats?.map((item) => {
        const statusLabels = {
          pending: "Chờ xử lý",
          confirmed: "Đã xác nhận",
          paid_partial: "Đã thanh toán 1 phần",
          paid_full: "Đã thanh toán đủ",
          completed: "Hoàn thành",
          cancelled: "Đã hủy",
        };
        return statusLabels[item.status] || item.status;
      }) || [],
    datasets: [
      {
        data:
          dashboardData?.charts?.orderStatusStats?.map((item) => item.count) ||
          [],
        backgroundColor: [
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
          "#06b6d4",
          "#f97316",
        ],
      },
    ],
  };
  const carCategoryData = {
    labels:
      dashboardData?.charts?.carCategoryStats?.map((item) => item._id) || [],
    datasets: [
      {
        label: "Số lượng xe",
        data:
          dashboardData?.charts?.carCategoryStats?.map((item) => item.count) ||
          [],
        backgroundColor: "#3b82f6",
      },
    ],
  };
  // Advanced analytics charts
  const userGrowthData = {
    labels: analytics?.userGrowthTrend?.map((item) => item.date) || [],
    datasets: [
      {
        label: "Người dùng mới",
        data: analytics?.userGrowthTrend?.map((item) => item.newUsers) || [],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
      },
      {
        label: "Tổng người dùng",
        data: analytics?.userGrowthTrend?.map((item) => item.totalUsers) || [],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const userCompositionData = {
    labels: analytics?.userComposition?.map((item) => item.roleName) || [],
    datasets: [
      {
        data: analytics?.userComposition?.map((item) => item.count) || [],
        backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"],
      },
    ],
  };

  const carPostingData = {
    labels: analytics?.carPostingTrends?.map((item) => item.date) || [],
    datasets: [
      {
        label: "Xe đăng bán",
        data: analytics?.carPostingTrends?.map((item) => item.carsPosted) || [],
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const fuelTypeData = {
    labels: analytics?.carsByFuelType?.map((item) => item.fuelName) || [],
    datasets: [
      {
        data: analytics?.carsByFuelType?.map((item) => item.count) || [],
        backgroundColor: ["#ef4444", "#10b981", "#3b82f6", "#f59e0b"],
      },
    ],
  };
  const yearRangeData = {
    labels: analytics?.carsByYearRange?.map((item) => item._id) || [],
    datasets: [
      {
        label: "Số lượng xe",
        data: analytics?.carsByYearRange?.map((item) => item.count) || [],
        backgroundColor: "#8b5cf6",
      },
    ],
  };
  const systemActivityData = {
    labels: analytics?.systemActivityLogs?.map((item) => item.activity) || [],
    datasets: [
      {
        label: "Số hoạt động",
        data: analytics?.systemActivityLogs?.map((item) => item.count) || [],
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
      },
    ],
  };

  const carStatusData = {
    labels: analytics?.carsByStatus?.map((item) => item.statusName) || [],
    datasets: [
      {
        label: "Số lượng xe",
        data: analytics?.carsByStatus?.map((item) => item.count) || [],
        backgroundColor: ["#10b981", "#ef4444", "#f59e0b", "#6b7280"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  if (loading) {
    return (
      <div className="admin-dashboard loading">
        <div className="loading-spinner">Đang tải dữ liệu...</div>
      </div>
    );
  }
  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard Quản Trị</h1>
          <p>Tổng quan hệ thống mua bán xe</p>
        </div>

        <div className="period-selector">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="90d">90 ngày qua</option>
            <option value="1y">1 năm qua</option>
          </select>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card users">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>
              {dashboardData?.overview?.totalUsers?.toLocaleString() || 0}
            </h3>
            <p>Tổng người dùng</p>
            <small>
              Seller: {dashboardData?.overview?.totalSellers || 0} | Buyer:{" "}
              {dashboardData?.overview?.totalBuyers || 0}
            </small>
          </div>
        </div>

        <div className="stat-card cars">
          <div className="stat-icon">
            <FaCar />
          </div>
          <div className="stat-content">
            <h3>{dashboardData?.overview?.totalCars?.toLocaleString() || 0}</h3>
            <p>Tổng số xe</p>
            <small>
              Đang bán: {dashboardData?.overview?.activeCars || 0} | Đã bán:{" "}
              {dashboardData?.overview?.soldCars || 0}
            </small>
          </div>
        </div>

        <div className="stat-card orders">
          <div className="stat-icon">
            <FaShoppingCart />
          </div>
          <div className="stat-content">
            <h3>
              {dashboardData?.overview?.totalOrders?.toLocaleString() || 0}
            </h3>
            <p>Tổng đơn hàng</p>
            <small>
              Hoàn thành: {dashboardData?.overview?.completedOrders || 0} | Chờ
              xử lý: {dashboardData?.overview?.pendingOrders || 0}
            </small>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-icon">
            <FaMoneyBillWave />
          </div>
          <div className="stat-content">
            <h3>
              {formatCurrency(dashboardData?.overview?.totalRevenue || 0)}
            </h3>
            <p>Tổng doanh thu</p>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">
            <FaExclamationTriangle />
          </div>
          <div className="stat-content">
            <h3>{dashboardData?.overview?.pendingRequests || 0}</h3>
            <p>Yêu cầu chờ duyệt</p>
            <small>
              Đã duyệt: {dashboardData?.overview?.approvedRequests || 0} | Từ
              chối: {dashboardData?.overview?.rejectedRequests || 0}
            </small>
          </div>
        </div>

        <div className="stat-card active">
          <div className="stat-icon">
            <FaCarSide />
          </div>
          <div className="stat-content">
            <h3>{dashboardData?.overview?.activeCars || 0}</h3>
            <p>Xe đang bán</p>
          </div>
        </div>
      </div>{" "}
      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Doanh thu theo tháng</h3>
          <Line data={revenueChartData} options={chartOptions} />
        </div>
        <div className="chart-card">
          <h3>Trạng thái đơn hàng</h3>
          <Doughnut data={orderStatusData} options={chartOptions} />
        </div>{" "}
        <div className="chart-card">
          <h3>Hoạt động hệ thống</h3>
          <Bar data={systemActivityData} options={chartOptions} />
        </div>
      </div>
      {/* Advanced Analytics Charts */}
      <div className="advanced-charts-section">
        <h2>Thống kê nâng cao</h2>
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Tốc độ tăng người dùng</h3>
            <Line data={userGrowthData} options={chartOptions} />
          </div>
          <div className="chart-card">
            <h3>Thành phần người dùng</h3>
            <Doughnut data={userCompositionData} options={chartOptions} />
          </div>
          <div className="chart-card">
            <h3>Xe đăng bán theo thời gian</h3>
            <Line data={carPostingData} options={chartOptions} />
          </div>
          <div className="chart-card">
            <h3>Xe theo nhiên liệu</h3>
            <Doughnut data={fuelTypeData} options={chartOptions} />
          </div>
          <div className="chart-card">
            <h3>Xe theo năm sản xuất</h3>
            <Bar data={yearRangeData} options={chartOptions} />{" "}
          </div>{" "}
          <div className="chart-card">
            <h3>Xe theo trạng thái</h3>
            <Doughnut data={carStatusData} options={chartOptions} />
          </div>
        </div>{" "}
        {/* Revenue Comparison */}
        {analytics?.revenueComparison && (
          <div className="revenue-comparison-card">
            <h3>
              So sánh doanh thu (
              {analytics.revenueComparison.period || selectedPeriod})
            </h3>
            <div className="comparison-content">
              <div className="revenue-metrics">
                <div className="metric-box current">
                  <div className="metric-label">Kỳ hiện tại</div>
                  <div className="metric-value">
                    {formatCurrency(analytics.revenueComparison.currentPeriod)}
                  </div>
                  <div className="metric-subtitle">
                    {analytics.revenueComparison.currentOrders} đơn hàng
                  </div>
                </div>

                <div className="metric-box previous">
                  <div className="metric-label">Kỳ trước</div>
                  <div className="metric-value">
                    {formatCurrency(analytics.revenueComparison.previousPeriod)}
                  </div>
                  <div className="metric-subtitle">
                    {analytics.revenueComparison.previousOrders} đơn hàng
                  </div>
                </div>

                <div
                  className={`metric-box growth ${
                    analytics.revenueComparison.growthRate >= 0
                      ? "positive"
                      : "negative"
                  }`}
                >
                  <div className="metric-label">Tăng trưởng</div>
                  <div className="metric-value">
                    {analytics.revenueComparison.growthRate >= 0 ? "+" : ""}
                    {analytics.revenueComparison.growthRate}%
                  </div>
                  <div className="metric-subtitle">So với kỳ trước</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Recent Activities */}
      <div className="activities-section">
        <h3>Hoạt động gần đây</h3>
        <div className="activities-list">
          {(dashboardData?.recentActivities || []).map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className={`activity-icon ${activity.type}`}>
                {activity.type === "order" && <FaShoppingCart />}
                {activity.type === "request" && <FaUserCheck />}
                {activity.type === "user" && <FaUsers />}
              </div>
              <div className="activity-content">
                <p>{activity.message}</p>
                <span className="activity-time">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Thao tác nhanh</h3>
        <div className="actions-grid">
          <button className="action-btn">
            <FaUserCheck />
            Duyệt yêu cầu
          </button>
          <button className="action-btn">
            <FaUsers />
            Quản lý users
          </button>
          <button className="action-btn">
            <FaCar />
            Quản lý xe
          </button>
          <button className="action-btn">
            <FaChartLine />
            Báo cáo
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
