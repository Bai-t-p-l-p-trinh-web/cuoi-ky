import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { orderAPI } from "../../../utils/axiosConfig";
import {
  FaSearch,
  FaEye,
  FaDownload,
  FaCheck,
  FaTimes,
  FaCreditCard,
  FaFileContract,
  FaShippingFast,
  FaClock,
  FaMoneyBillWave,
  FaFilter,
  FaCalendarAlt,
  FaChartLine,
  FaBoxOpen,
  FaUser,
  FaCar,
  FaShoppingCart,
  FaSellsy,
} from "react-icons/fa";
import "../scss/OrderHistory.scss";

const OrderHistory = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const [buyerOrders, setBuyerOrders] = useState([]); // Đơn hàng user tạo
  const [sellerOrders, setSellerOrders] = useState([]); // Đơn hàng người khác mua xe của user
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("buyer"); // 'buyer', 'seller'
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        role: "all",
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchTerm,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      const response = await orderAPI.getUserOrders(params);
      console.log("Order response:", response);

      if (response.data.success) {
        setBuyerOrders(response.data.data.buyerOrders || []);
        setSellerOrders(response.data.data.sellerOrders || []);
      } else {
        setBuyerOrders([]);
        setSellerOrders([]);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách đơn hàng");
      console.error("Error fetching orders:", error);
      setBuyerOrders([]);
      setSellerOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrderDetail = async (orderId) => {
    try {
      const response = await orderAPI.getDetail(orderId);
      if (response.data.success) {
        setSelectedOrder(response.data.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      toast.error("Không thể tải chi tiết đơn hàng");
      console.error("Error fetching order detail:", error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      awaiting_payment: {
        label: "Chờ thanh toán",
        color: "warning",
        icon: FaClock,
      },
      paid_partial: { label: "Đã cọc", color: "info", icon: FaMoneyBillWave },
      paid_full: { label: "Đã thanh toán", color: "success", icon: FaCheck },
      pending_meeting: { label: "Chờ gặp mặt", color: "info", icon: FaClock },
      waiting_confirmation: {
        label: "Chờ xác nhận",
        color: "warning",
        icon: FaClock,
      },
      delivery_in_progress: {
        label: "Đang giao xe",
        color: "primary",
        icon: FaShippingFast,
      },
      delivered: { label: "Đã giao xe", color: "success", icon: FaCheck },
      completed: { label: "Hoàn thành", color: "success", icon: FaCheck },
      cancelled_by_buyer: { label: "Đã hủy", color: "danger", icon: FaTimes },
      cancelled_by_seller: {
        label: "Seller hủy",
        color: "danger",
        icon: FaTimes,
      },
      refunding: {
        label: "Đang hoàn tiền",
        color: "warning",
        icon: FaMoneyBillWave,
      },
      refunded: { label: "Đã hoàn tiền", color: "info", icon: FaMoneyBillWave },
    };

    const config = statusConfig[status] || {
      label: status || "Không xác định",
      color: "secondary",
      icon: FaClock,
    };

    const IconComponent = config.icon;

    return (
      <span className={`status-badge ${config.color}`}>
        <IconComponent className="status-icon" />
        {config.label}
      </span>
    );
  };

  const getRoleBadge = (order) => {
    const currentUserId = currentUser?._id || currentUser?.id;
    const isBuyer =
      order.buyer?._id === currentUserId || order.buyer === currentUserId;
    const isSeller =
      order.seller?._id === currentUserId || order.seller === currentUserId;

    if (isBuyer) {
      return (
        <span className="role-badge buyer">
          <FaShoppingCart className="role-icon" />
          Người mua
        </span>
      );
    } else if (isSeller) {
      return (
        <span className="role-badge seller">
          <FaSellsy className="role-icon" />
          Người bán
        </span>
      );
    }
    return null;
  };

  // Calculate summary statistics
  const summaryStats = {
    totalBuyer: buyerOrders.length,
    totalSeller: sellerOrders.length,
    total: buyerOrders.length + sellerOrders.length,
    completedBuyer: buyerOrders.filter((o) => o.status === "completed").length,
    completedSeller: sellerOrders.filter((o) => o.status === "completed")
      .length,
  };

  // Get current active orders for display
  const currentOrders = activeTab === "buyer" ? buyerOrders : sellerOrders;

  if (loading) {
    return (
      <div className="order-history">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải lịch sử đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history">
      {/* Header Section */}
      <div className="page-header">
        <div className="header-content">
          <div className="title-section">
            <h1>
              <FaFileContract className="title-icon" />
              Lịch sử đơn hàng
            </h1>
            <p className="subtitle">Xem tất cả đơn hàng bạn đã tham gia</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card total">
            <div className="card-icon">
              <FaBoxOpen />
            </div>
            <div className="card-content">
              <h3>{summaryStats.total}</h3>
              <p>Tổng đơn hàng</p>
            </div>
          </div>

          <div className="summary-card buyer">
            <div className="card-icon">
              <FaShoppingCart />
            </div>
            <div className="card-content">
              <h3>{summaryStats.totalBuyer}</h3>
              <p>Đơn mua</p>
            </div>
          </div>

          <div className="summary-card seller">
            <div className="card-icon">
              <FaSellsy />
            </div>
            <div className="card-content">
              <h3>{summaryStats.totalSeller}</h3>
              <p>Đơn bán</p>
            </div>
          </div>

          <div className="summary-card completed">
            <div className="card-icon">
              <FaCheck />
            </div>
            <div className="card-content">
              <h3>
                {summaryStats.completedBuyer + summaryStats.completedSeller}
              </h3>
              <p>Hoàn thành</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="tabs-section">
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === "buyer" ? "active" : ""}`}
            onClick={() => setActiveTab("buyer")}
          >
            <FaShoppingCart className="tab-icon" />
            Đơn mua của tôi ({summaryStats.totalBuyer})
          </button>
          <button
            className={`tab-button ${activeTab === "seller" ? "active" : ""}`}
            onClick={() => setActiveTab("seller")}
          >
            <FaSellsy className="tab-icon" />
            Đơn bán xe của tôi ({summaryStats.totalSeller})
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn hàng hoặc tên xe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <div className="filter-item">
            <FaFilter className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="awaiting_payment">Chờ thanh toán</option>
              <option value="paid_partial">Đã cọc</option>
              <option value="paid_full">Đã thanh toán</option>
              <option value="pending_meeting">Chờ gặp mặt</option>
              <option value="waiting_confirmation">Chờ xác nhận</option>
              <option value="delivery_in_progress">Đang giao xe</option>
              <option value="delivered">Đã giao xe</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled_by_buyer">Đã hủy</option>
              <option value="refunding">Đang hoàn tiền</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="orders-section">
        {currentOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FaBoxOpen />
            </div>
            <h3>Không có đơn hàng nào</h3>
            <p>
              {activeTab === "buyer"
                ? "Bạn chưa tạo đơn hàng nào để mua xe."
                : "Chưa có ai mua xe của bạn."}
            </p>
          </div>
        ) : (
          <div className="orders-list">
            {currentOrders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h4 className="order-code">#{order.orderCode}</h4>
                    <span className="order-date">
                      <FaCalendarAlt />
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div className="order-status">
                    {getStatusBadge(order.status)}
                    {getRoleBadge(order)}
                  </div>
                </div>

                <div className="order-content">
                  <div className="car-info">
                    <div className="car-image">
                      {order.car?.images?.[0] ? (
                        <img
                          src={order.car.images[0]}
                          alt={order.car.title || order.car.name}
                        />
                      ) : (
                        <div className="no-image">
                          <FaCar />
                        </div>
                      )}
                    </div>
                    <div className="car-details">
                      <h5>{order.car?.title || order.car?.name}</h5>
                      <p className="car-brand">
                        {order.car?.brand} {order.car?.year}
                      </p>
                      <p className="car-price">
                        {formatCurrency(order.car?.price || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="participants">
                    <div className="participant buyer">
                      <FaUser className="participant-icon" />
                      <div>
                        <span className="label">Người mua:</span>
                        <span className="name">{order.buyer?.name}</span>
                      </div>
                    </div>
                    <div className="participant seller">
                      <FaUser className="participant-icon" />
                      <div>
                        <span className="label">Người bán:</span>
                        <span className="name">{order.seller?.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="payment-info">
                    <div className="payment-method">
                      <FaCreditCard className="payment-icon" />
                      <span>
                        {order.paymentMethod === "deposit" && "Thanh toán cọc"}
                        {order.paymentMethod === "full_payment" &&
                          "Thanh toán toàn bộ"}
                        {order.paymentMethod === "direct_transaction" &&
                          "Giao dịch trực tiếp"}
                      </span>
                    </div>
                    <div className="amounts">
                      <div className="amount-item">
                        <span className="label">Tổng tiền: </span>
                        <span className="value">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </div>
                      {order.depositAmount > 0 && (
                        <div className="amount-item">
                          <span className="label">Tiền cọc: </span>
                          <span className="value">
                            {formatCurrency(order.depositAmount)}
                          </span>
                        </div>
                      )}
                      {order.paidAmount > 0 && (
                        <div className="amount-item">
                          <span className="label">Đã thanh toán: </span>
                          <span className="value paid">
                            {formatCurrency(order.paidAmount)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="order-actions">
                  <button
                    className="action-button view"
                    onClick={() => handleViewOrderDetail(order._id)}
                  >
                    <FaEye />
                    Xem chi tiết
                  </button>

                  {order.contract?.url && (
                    <button
                      className="action-button download"
                      onClick={() => window.open(order.contract.url, "_blank")}
                    >
                      <FaDownload />
                      Tải hợp đồng
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết đơn hàng #{selectedOrder.order?.orderCode}</h3>
              <button
                className="close-button"
                onClick={() => setShowDetailModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h4>Thông tin đơn hàng</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Mã đơn hàng:</span>
                    <span className="value">
                      #{selectedOrder.order?.orderCode}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Trạng thái:</span>
                    <span className="value">
                      {getStatusBadge(selectedOrder.order?.status)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Ngày tạo:</span>
                    <span className="value">
                      {formatDate(selectedOrder.order?.createdAt)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Vai trò của bạn:</span>
                    <span className="value">
                      {getRoleBadge(selectedOrder.order)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Thông tin xe</h4>
                <div className="car-detail">
                  <div className="car-image-large">
                    {selectedOrder.order?.car?.images?.[0] ? (
                      <img
                        src={selectedOrder.order.car.images[0]}
                        alt={selectedOrder.order.car.title}
                      />
                    ) : (
                      <div className="no-image">
                        <FaCar />
                      </div>
                    )}
                  </div>
                  <div className="car-info-detail">
                    <h5>{selectedOrder.order?.car?.title}</h5>
                    <p>
                      {selectedOrder.order?.car?.brand} -{" "}
                      {selectedOrder.order?.car?.year}
                    </p>
                    <p className="price">
                      {formatCurrency(selectedOrder.order?.car?.price || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Lịch sử thanh toán</h4>
                <div className="payments-list">
                  {selectedOrder.payments?.length > 0 ? (
                    selectedOrder.payments.map((payment) => (
                      <div key={payment._id} className="payment-item">
                        <div className="payment-info">
                          <span className="payment-code">
                            #{payment.paymentCode}
                          </span>
                          <span className="payment-amount">
                            {formatCurrency(payment.amount)}
                          </span>
                          <span className={`payment-status ${payment.status}`}>
                            {payment.status === "completed" && "Hoàn thành"}
                            {payment.status === "pending" && "Chờ xác minh"}
                            {payment.status === "rejected" && "Bị từ chối"}
                          </span>
                        </div>
                        <div className="payment-date">
                          {formatDate(payment.createdAt)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Chưa có thanh toán nào</p>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="button secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
