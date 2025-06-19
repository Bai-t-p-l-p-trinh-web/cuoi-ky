import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { adminAPI } from "../../../utils/axiosConfig";
import {
  FaSearch,
  FaFilter,
  FaCheck,
  FaTimes,
  FaEye,
  FaSpinner,
  FaMoneyBillWave,
  FaCreditCard,
  FaExclamationTriangle,
  FaClock,
} from "react-icons/fa";
import "./AdminPaymentManagement.scss";

const AdminPaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: searchTerm,
        status: filterStatus,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      const response = await adminAPI.getPayments(params);
      console.log(response);
      if (response.data.success) {
        setPayments(response.data.data.payments);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Không thể tải dữ liệu thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleSearchSubmit = () => {
    fetchPayments(1);
  };

  const handlePageChange = (page) => {
    fetchPayments(page);
  };

  const handleUpdatePaymentStatus = async (paymentId, status, notes = "") => {
    try {
      const response = await adminAPI.updatePaymentStatus(paymentId, {
        status: status,
        notes: notes,
      });

      if (response.data.success) {
        toast.success("Cập nhật trạng thái thanh toán thành công");
        fetchPayments(pagination.currentPage);
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error(
        error.response?.data?.message ||
          "Không thể cập nhật trạng thái thanh toán"
      );
    }
  };

  const handleViewPaymentDetail = async (paymentId) => {
    try {
      const response = await adminAPI.getPaymentDetail(paymentId);
      if (response.data.success) {
        setSelectedPayment(response.data.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error("Error fetching payment detail:", error);
      toast.error("Không thể tải chi tiết thanh toán");
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
      pending: { label: "Chờ xác nhận", color: "warning", icon: FaClock },
      completed: { label: "Hoàn thành", color: "success", icon: FaCheck },
      failed: { label: "Thất bại", color: "danger", icon: FaTimes },
      refunded: { label: "Đã hoàn tiền", color: "info", icon: FaMoneyBillWave },
      cancelled: { label: "Đã hủy", color: "secondary", icon: FaTimes },
      deposited: { label: "Đã cọc", color: "info", icon: FaMoneyBillWave },
    };

    const config = statusConfig[status] || {
      label: status || "Không xác định",
      color: "secondary",
      icon: FaExclamationTriangle,
    };
    const IconComponent = config.icon;

    return (
      <span className={`status-badge ${config.color}`}>
        <IconComponent className="status-icon" />
        {config.label}
      </span>
    );
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      bank_transfer: "Chuyển khoản ngân hàng",
      e_wallet: "Ví điện tử",
      cash: "Tiền mặt",
      credit_card: "Thẻ tín dụng",
    };
    return methods[method] || method;
  };

  return (
    <div className="admin-payment-management">
      <div className="page-header">
        <h1>
          <FaMoneyBillWave className="page-icon" />
          Quản lý thanh toán
        </h1>
        <p>Quản lý và theo dõi các giao dịch thanh toán</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch />{" "}
          <input
            type="text"
            placeholder="Tìm kiếm theo mã GD, tên khách hàng, email hoặc tên xe..."
            value={searchTerm}
            onChange={handleSearch}
            onKeyPress={(e) => e.key === "Enter" && handleSearchSubmit()}
          />
          <button onClick={handleSearchSubmit} className="search-btn">
            Tìm kiếm
          </button>
        </div>

        <div className="filter-controls">
          {" "}
          <select value={filterStatus} onChange={handleFilterChange}>
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="completed">Hoàn thành</option>
            <option value="failed">Thất bại</option>
            <option value="refunded">Đã hoàn tiền</option>
            <option value="cancelled">Đã hủy</option>
            <option value="deposited">Đã cọc</option>
          </select>
          <button onClick={handleSearchSubmit} className="filter-btn">
            <FaFilter />
            Lọc
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="payments-section">
        {loading ? (
          <div className="loading-content">
            <FaSpinner className="spinning" />
            <span>Đang tải dữ liệu...</span>
          </div>
        ) : (
          <>
            {" "}
            <div className="payments-grid">
              {payments.length === 0 ? (
                <div className="no-data">
                  <FaExclamationTriangle className="no-data-icon" />
                  <p>Không có dữ liệu thanh toán</p>
                </div>
              ) : (
                payments.map((payment) => (
                  <div key={payment._id} className="payment-card">
                    <div className="payment-header">
                      <div className="payment-info">
                        <h3>
                          <FaCreditCard className="card-icon" />
                          Giao dịch #{payment._id.slice(-6)}
                        </h3>{" "}
                        <p className="transaction-id">
                          <strong>Mã GD:</strong>{" "}
                          {payment.paymentCode ||
                            payment.transactionId ||
                            "N/A"}
                        </p>
                        <p className="user-info">
                          <strong>Khách hàng:</strong>{" "}
                          {payment.user?.name || "N/A"}
                        </p>
                        <p className="user-email">
                          {payment.user?.email || "N/A"}
                        </p>
                      </div>
                      <div className="payment-status">
                        {getStatusBadge(payment.status)}
                        <p className="created-date">
                          {formatDate(payment.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="payment-details">
                      <div className="amount-info">
                        <span className="amount-label">Số tiền:</span>
                        <span className="amount-value">
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>{" "}
                      <div className="method-info">
                        <span className="method-label">Phương thức:</span>
                        <span className="method-value">
                          {getPaymentMethodLabel(
                            payment.paymentMethod || "bank_transfer"
                          )}
                        </span>
                      </div>
                      {payment.type && (
                        <div className="type-info">
                          <span className="type-label">Loại:</span>
                          <span className="type-value">
                            {payment.type === "deposit"
                              ? "Cọc"
                              : payment.type === "final_payment"
                              ? "Thanh toán cuối"
                              : payment.type === "full_payment"
                              ? "Thanh toán đầy đủ"
                              : payment.type}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="payment-actions">
                      <button
                        className="btn-info"
                        onClick={() => handleViewPaymentDetail(payment._id)}
                      >
                        <FaEye />
                        Chi tiết
                      </button>
                      {payment.status === "pending" && (
                        <>
                          <button
                            className="btn-approve"
                            onClick={() =>
                              handleUpdatePaymentStatus(
                                payment._id,
                                "completed",
                                "Xác nhận từ admin"
                              )
                            }
                          >
                            <FaCheck />
                            Xác nhận
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() =>
                              handleUpdatePaymentStatus(
                                payment._id,
                                "failed",
                                "Từ chối từ admin"
                              )
                            }
                          >
                            <FaTimes />
                            Từ chối
                          </button>
                        </>
                      )}{" "}
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="pagination-btn"
                >
                  Trước
                </button>

                <span className="pagination-info">
                  Trang {pagination.currentPage} / {pagination.totalPages}(
                  {pagination.totalItems} giao dịch)
                </span>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="pagination-btn"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedPayment && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết thanh toán</h3>
              <button
                className="close-btn"
                onClick={() => setShowDetailModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Thông tin giao dịch</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>ID Giao dịch:</label>
                    <span>{selectedPayment._id}</span>
                  </div>{" "}
                  <div className="detail-item">
                    <label>Mã giao dịch:</label>
                    <span>
                      {selectedPayment.paymentCode ||
                        selectedPayment.transactionId ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Số tiền:</label>
                    <span className="amount">
                      {formatCurrency(selectedPayment.amount)}
                    </span>
                  </div>{" "}
                  <div className="detail-item">
                    <label>Phương thức:</label>
                    <span>
                      {getPaymentMethodLabel(
                        selectedPayment.paymentMethod || "bank_transfer"
                      )}
                    </span>
                  </div>
                  {selectedPayment.type && (
                    <div className="detail-item">
                      <label>Loại thanh toán:</label>
                      <span>
                        {selectedPayment.type === "deposit"
                          ? "Cọc"
                          : selectedPayment.type === "final_payment"
                          ? "Thanh toán cuối"
                          : selectedPayment.type === "full_payment"
                          ? "Thanh toán đầy đủ"
                          : selectedPayment.type}
                      </span>
                    </div>
                  )}
                  <div className="detail-item">
                    <label>Trạng thái:</label>
                    {getStatusBadge(selectedPayment.status)}
                  </div>{" "}
                  <div className="detail-item">
                    <label>Ngày tạo:</label>
                    <span>{formatDate(selectedPayment.createdAt)}</span>
                  </div>
                  {selectedPayment.note && (
                    <div className="detail-item">
                      <label>Ghi chú:</label>
                      <span>{selectedPayment.note}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedPayment.user && (
                <div className="detail-section">
                  <h4>Thông tin khách hàng</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Tên:</label>
                      <span>{selectedPayment.user.name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{selectedPayment.user.email}</span>
                    </div>
                    <div className="detail-item">
                      <label>Số điện thoại:</label>
                      <span>{selectedPayment.user.phone || "N/A"}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedPayment.seller && (
                <div className="detail-section">
                  <h4>Thông tin người bán</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Tên:</label>
                      <span>{selectedPayment.seller.name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{selectedPayment.seller.email}</span>
                    </div>
                    <div className="detail-item">
                      <label>Số điện thoại:</label>
                      <span>{selectedPayment.seller.phone || "N/A"}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedPayment.order && (
                <div className="detail-section">
                  <h4>Thông tin xe</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>ID xe:</label>
                      <span>{selectedPayment.order._id}</span>
                    </div>
                    <div className="detail-item">
                      <label>Tên xe:</label>
                      <span>{selectedPayment.order.title}</span>
                    </div>
                    <div className="detail-item">
                      <label>Trạng thái xe:</label>
                      <span>{selectedPayment.order.status}</span>
                    </div>{" "}
                    <div className="detail-item">
                      <label>Giá xe:</label>
                      <span>
                        {formatCurrency(selectedPayment.order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {selectedPayment.note && (
                <div className="detail-section">
                  <h4>Ghi chú</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Nội dung:</label>
                      <span>{selectedPayment.note}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-actions">
              {selectedPayment.status === "pending" && (
                <>
                  <button
                    className="btn-approve"
                    onClick={() =>
                      handleUpdatePaymentStatus(
                        selectedPayment._id,
                        "completed",
                        "Xác nhận từ admin"
                      )
                    }
                  >
                    <FaCheck />
                    Xác nhận thanh toán
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() =>
                      handleUpdatePaymentStatus(
                        selectedPayment._id,
                        "failed",
                        "Từ chối từ admin"
                      )
                    }
                  >
                    <FaTimes />
                    Từ chối thanh toán
                  </button>
                </>
              )}
              <button
                className="btn-secondary"
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

export default AdminPaymentManagement;
