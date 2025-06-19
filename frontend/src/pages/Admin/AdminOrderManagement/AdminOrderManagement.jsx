import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { adminAPI } from "../../../utils/axiosConfig";
import {
  FaSearch,
  FaFilter,
  FaShoppingCart,
  FaEye,
  FaCheck,
  FaTimes,
  FaClock,
  FaMoneyBillWave,
  FaSpinner,
  FaCarSide,
  FaUser,
  FaCalendarAlt,
} from "react-icons/fa";
import AdminPaymentVerification from "../../../components/admin/AdminPaymentVerification";
import "./AdminOrderManagement.scss";

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("orders");

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [filter, searchTerm, activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        status: filter,
        page: 1,
        limit: 100,
      };

      const response = await adminAPI.getOrders(params);
      if (response.data.success) {
        setOrders(response.data.data.orders);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách đơn hàng");
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await adminAPI.updateOrderStatus(orderId, {
        status: newStatus,
        notes: `Cập nhật từ admin panel`,
      });

      if (response.data.success) {
        toast.success("Cập nhật trạng thái đơn hàng thành công");
        fetchOrders(); // Refresh the list
      }
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái đơn hàng");
      console.error("Error updating order status:", error);
    }
  };
  const getStatusConfig = (status) => {
    const statusConfig = {
      pending: { label: "Chờ xử lý", color: "warning", icon: FaClock },
      confirmed: { label: "Đã xác nhận", color: "info", icon: FaCheck },
      paid_partial: {
        label: "Đã đặt cọc",
        color: "primary",
        icon: FaMoneyBillWave,
      },
      paid_full: { label: "Đã thanh toán", color: "success", icon: FaCheck },
      completed: { label: "Hoàn thành", color: "success", icon: FaCheck },
      cancelled: { label: "Đã hủy", color: "danger", icon: FaTimes },
    };

    return (
      statusConfig[status] || {
        label: status,
        color: "secondary",
        icon: FaClock,
      }
    );
  };

  const getStatusBadge = (status) => {
    const config = getStatusConfig(status);
    const Icon = config.icon;
    return (
      <span className={`status-badge ${config.color}`}>
        <Icon />
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="admin-order-management">
      <div className="page-header">
        <h1>
          <FaShoppingCart className="icon" />
          Quản lý đơn hàng
        </h1>
        <p className="subtitle">
          Quản lý và theo dõi tất cả đơn hàng trên hệ thống
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Tổng đơn hàng</span>
            <div className="stat-icon info">
              <FaShoppingCart />
            </div>
          </div>
          <div className="stat-value">{orders.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Chờ xử lý</span>
            <div className="stat-icon warning">
              <FaClock />
            </div>
          </div>
          <div className="stat-value">
            {orders.filter((o) => o.status === "pending").length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Hoàn thành</span>
            <div className="stat-icon success">
              <FaCheck />
            </div>
          </div>
          <div className="stat-value">
            {orders.filter((o) => o.status === "completed").length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Tổng doanh thu</span>
            <div className="stat-icon success">
              <FaMoneyBillWave />
            </div>
          </div>
          <div className="stat-value">
            {formatCurrency(
              orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "orders" ? "active" : ""}
          onClick={() => setActiveTab("orders")}
        >
          <FaShoppingCart />
          Đơn hàng
        </button>
        <button
          className={activeTab === "payments" ? "active" : ""}
          onClick={() => setActiveTab("payments")}
        >
          <FaMoneyBillWave />
          Thanh toán
        </button>
      </div>

      <div className="content">
        {activeTab === "orders" && (
          <>
            {/* Controls Section */}
            <div className="controls-section">
              <div className="controls-header">
                <h3>Danh sách đơn hàng</h3>
              </div>
              <div className="filters-row">
                <div className="search-group">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Tìm kiếm theo ID đơn hàng, tên xe, người mua..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <select
                    className="filter-select"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="paid_partial">Đã đặt cọc</option>
                    <option value="paid_full">Đã thanh toán</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="loading">
                <FaSpinner className="spinner" />
                Đang tải danh sách đơn hàng...
              </div>
            ) : orders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <FaShoppingCart />
                </div>
                <div className="empty-title">Không có đơn hàng nào</div>
                <div className="empty-description">
                  Chưa có đơn hàng nào được tạo trong hệ thống
                </div>
              </div>
            ) : (
              <div className="orders-grid">
                {orders.map((order) => (
                  <div key={order._id} className={`order-card ${order.status}`}>
                    <div className="card-header">
                      <div className="order-id">#{order._id.slice(-8)}</div>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="order-info">
                      <div className="car-section">
                        <div className="section-title">
                          <FaCarSide />
                          Thông tin xe
                        </div>
                        <div className="car-details">
                          {order.car?.img_demo && (
                            <img
                              src={order.car.img_demo}
                              alt={order.car.title}
                              className="car-image"
                            />
                          )}
                          <div className="car-info">
                            <div className="car-title">
                              {order.car?.title || "N/A"}
                            </div>
                            <div className="car-price">
                              {formatCurrency(order.car?.price || 0)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="buyer-section">
                        <div className="section-title">
                          <FaUser />
                          Người mua
                        </div>
                        <div className="buyer-details">
                          <div className="buyer-name">
                            {order.buyer?.name || "N/A"}
                          </div>
                          <div className="buyer-contact">
                            <div>{order.buyer?.email || "N/A"}</div>
                            <div>{order.buyer?.phone || "N/A"}</div>
                          </div>
                        </div>
                      </div>

                      <div className="payment-section">
                        <div className="section-title">
                          <FaMoneyBillWave />
                          Thanh toán
                        </div>
                        <div className="payment-details">
                          <div className="payment-row">
                            <span className="label">Tổng tiền:</span>
                            <span className="value amount">
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </div>
                          <div className="payment-row">
                            <span className="label">Tiền cọc:</span>
                            <span className="value">
                              {formatCurrency(order.depositAmount)}
                            </span>
                          </div>
                          <div className="payment-row">
                            <span className="label">Còn lại:</span>
                            <span className="value">
                              {formatCurrency(
                                order.totalAmount - order.depositAmount
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="date-section">
                        <div className="section-title">
                          <FaCalendarAlt />
                          Thời gian
                        </div>
                        <div className="date-info">
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="card-actions">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleUpdateOrderStatus(order._id, e.target.value)
                        }
                        className="status-select"
                      >
                        <option value="pending">Chờ xử lý</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="paid_partial">Đã đặt cọc</option>
                        <option value="paid_full">Đã thanh toán</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                      <button className="btn btn-outline">
                        <FaEye />
                        Chi tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "payments" && <AdminPaymentVerification />}
      </div>
    </div>
  );
};

export default AdminOrderManagement;
