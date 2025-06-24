import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { adminAPI, notificationAPI, chatAPI } from "../../../utils/axiosConfig";
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
  FaRoute,
  FaList,
  FaBell,
  FaComment,
} from "react-icons/fa";
import "./AdminPaymentManagement.scss";

const AdminPaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  // State cho QR giải ngân
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

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
        status: filterStatus === "all" ? undefined : filterStatus,
        sortBy: "createdAt",
        sortOrder: "desc",
      };
      const response = await adminAPI.getPayments(params);
      if (response.data.success) {
        const paymentsData = response.data.data.payments || [];
        setPayments(paymentsData);
        setPagination(
          response.data.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: paymentsData.length,
          }
        );
        if (paymentsData.length === 0) {
          toast.info("Không tìm thấy dữ liệu thanh toán phù hợp");
        }
      } else {
        throw new Error(response.data.message || "Failed to fetch payments");
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error(
        "Không thể tải dữ liệu thanh toán: " +
          (error.response?.data?.message || error.message)
      );
      setPayments([]);
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
      setActionLoading((prev) => ({ ...prev, [paymentId]: true }));
      const approved = status === "completed";
      const response = await adminAPI.verifyPayment({
        paymentId: paymentId,
        approved: approved,
        note: notes,
      });
      if (response.data.success) {
        toast.success(
          approved
            ? "✅ Xác minh thanh toán thành công!"
            : "❌ Đã từ chối thanh toán"
        );

        // If payment is confirmed, offer to send notification and create chat
        if (approved) {
          const payment =
            payments.find((p) => p._id === paymentId) || selectedPayment;
          if (payment) {
            handlePostPaymentActions(payment);
          }
        }

        fetchPayments(pagination.currentPage);
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast.error(
        error.response?.data?.message || "Không thể xác minh thanh toán"
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [paymentId]: false }));
    }
  };

  // Modular function to handle post-payment actions
  const handlePostPaymentActions = async (payment) => {
    if (!payment.user || !payment.order?.seller) {
      toast.warning(
        "Thiếu thông tin buyer hoặc seller để thực hiện các hành động"
      );
      return;
    }
    toast.success("Thanh toán đã được xác nhận thành công!");
  };
  // Function to send notifications
  const sendPaymentNotifications = async (payment) => {
    try {
      setActionLoading((prev) => ({
        ...prev,
        [`notify_${payment._id}`]: true,
      }));

      toast.info("📧 Đang gửi thông báo...");
      const notificationPromises = [];

      // Notification to buyer - cả payment.user và payment.order.buyer
      const buyer = payment.user || payment.order?.buyer;
      if (buyer) {
        notificationPromises.push(
          notificationAPI.create({
            recipient: buyer._id,
            type: "payment_confirmed",
            title: "Thanh toán đã được xác nhận",
            message: `Thanh toán ${
              payment.paymentCode || payment.transactionId
            } của bạn đã được xác nhận bởi admin. Bạn có thể liên hệ với người bán để sắp xếp giao xe.`,
            priority: "high",
            category: "payment",
          })
        );
      } // Notification to seller
      if (payment.order?.seller) {
        notificationPromises.push(
          notificationAPI.create({
            recipient: payment.order.seller._id,
            type: "payment_received",
            title: "Đã nhận được thanh toán",
            message: `Thanh toán cho xe "${payment.order.car.title}" đã được xác nhận. Bạn có thể liên hệ với khách hàng để sắp xếp giao xe.`,
            priority: "high",
            category: "payment",
          })
        );
      }
      await Promise.all(notificationPromises);
      const notificationCount = notificationPromises.length;
      const recipients = [];
      if (buyer) recipients.push("Buyer");
      if (payment.order?.seller) recipients.push("Seller");

      toast.success(
        `✅ Gửi thành công ${notificationCount} thông báo đến: ${recipients.join(
          ", "
        )}`
      );
    } catch (error) {
      console.error("Error sending notifications:", error);
      toast.error("Không thể gửi thông báo");
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`notify_${payment._id}`]: false,
      }));
    }
  };
  // Function to create chat
  const createPaymentChat = async (payment) => {
    try {
      setActionLoading((prev) => ({ ...prev, [`chat_${payment._id}`]: true }));
      toast.info("🔄 Đang tạo cuộc trò chuyện...");

      const buyer = payment.user || payment.order?.buyer;
      const seller = payment.order?.seller;
      if (!buyer || !seller) {
        toast.error("Không tìm thấy thông tin buyer hoặc seller");
        return;
      }
      const userDataFromStorage = localStorage.getItem("user");
      let adminId;
      if (userDataFromStorage) {
        try {
          const userData = JSON.parse(userDataFromStorage);
          adminId = userData?.id || userData?._id || userData?.userId;
        } catch (e) {}
      }
      if (!adminId) {
        toast.warning(
          "Không tìm thấy admin ID, nhưng sẽ tiếp tục thử tạo chat..."
        );
        adminId = "admin-test-id";
      }
      const buyerId = buyer._id;
      const sellerId = seller._id;
      // Admin - Buyer
      const chatPromises = [];
      chatPromises.push(
        chatAPI
          .startMessage({
            sellerId: buyerId,
          })
          .then((result) => {
            return { type: "admin-buyer", result };
          })
          .catch((error) => {
            throw { type: "admin-buyer", error };
          })
      );
      // Admin - Seller
      chatPromises.push(
        chatAPI
          .startMessage({
            sellerId: sellerId,
          })
          .then((result) => {
            return { type: "admin-seller", result };
          })
          .catch((error) => {
            throw { type: "admin-seller", error };
          })
      );
      const results = await Promise.allSettled(chatPromises);
      const successCount = results.filter(
        (result) => result.status === "fulfilled"
      ).length;
      const failedChats = [];
      const successChats = [];
      const chatNames = ["Admin-Buyer", "Admin-Seller"];
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          successChats.push(chatNames[index]);
        } else {
          failedChats.push(chatNames[index]);
        }
      });
      if (successCount === 2) {
        toast.success(
          `✅ Tạo thành công tất cả cuộc trò chuyện: ${successChats.join(
            ", "
          )}. Buyer và Seller có thể tự tạo chat với nhau.`
        );
      } else if (successCount > 0) {
        toast.warning(
          `⚠️ Tạo được ${successCount}/2 cuộc trò chuyện. \nThành công: ${successChats.join(
            ", "
          )}\nThất bại: ${failedChats.join(", ")}`
        );
      } else {
        toast.error(
          `❌ Không thể tạo cuộc trò chuyện nào. Thất bại: ${failedChats.join(
            ", "
          )}`
        );
      }
    } catch (error) {
      toast.error(`❌ Lỗi khi tạo cuộc trò chuyện: ${error.message || error}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [`chat_${payment._id}`]: false }));
    }
  };
  // Function xử lý tạo QR giải ngân cho seller
  const handleCreateTransferQR = async (payment) => {
    try {
      setQrLoading(true);
      setActionLoading((prev) => ({
        ...prev,
        [`qr_${payment._id}`]: true,
      }));

      toast.info("🔄 Đang tạo QR chuyển khoản...");

      const response = await adminAPI.createSellerTransferQR(payment._id);

      if (response.data.success) {
        setQrData(response.data.data);
        setShowQRModal(true);
        toast.success("✅ Tạo QR chuyển khoản thành công!");
      } else {
        toast.error(
          response.data.message || "❌ Không thể tạo QR chuyển khoản"
        );
      }
    } catch (error) {
      console.error("Error creating transfer QR:", error);
      const errorMessage =
        error.response?.data?.message || "❌ Lỗi khi tạo QR chuyển khoản";
      toast.error(errorMessage);
    } finally {
      setQrLoading(false);
      setActionLoading((prev) => ({
        ...prev,
        [`qr_${payment._id}`]: false,
      }));
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
              {!payments || payments.length === 0 ? (
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
                          Giao dịch #{payment._id?.slice(-6) || "N/A"}
                        </h3>
                        <p className="transaction-id">
                          <strong>Mã GD:</strong>{" "}
                          {payment.transactionInfo?.bankTransactionId ||
                            payment.paymentCode ||
                            payment.transactionId ||
                            "Chưa có"}
                        </p>
                        <p className="user-info">
                          <strong>Người chuyển:</strong>{" "}
                          {payment.user?.fullName ||
                            payment.user?.name ||
                            payment.transactionInfo?.payerName ||
                            "Chưa có thông tin"}
                        </p>
                        <p className="user-email">
                          <strong>Email:</strong> {payment.user?.email || "N/A"}
                        </p>
                        <p className="transfer-message">
                          <strong>Lời nhắn:</strong>{" "}
                          {payment.transactionInfo?.transferMessage ||
                            payment.qrCode?.content ||
                            "Không có"}
                        </p>
                      </div>
                      <div className="payment-status">
                        {getStatusBadge(payment.status)}
                        <p className="created-date">
                          {formatDate(payment.createdAt)}
                        </p>
                        {payment.verifiedAt && (
                          <p className="verified-date">
                            <small>
                              Xác minh: {formatDate(payment.verifiedAt)}
                            </small>
                          </p>
                        )}
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
                    </div>{" "}
                    <div className="payment-actions">
                      {payment.status === "pending" && (
                        <>
                          {" "}
                          <button
                            className="btn-approve"
                            onClick={() =>
                              handleUpdatePaymentStatus(
                                payment._id,
                                "completed",
                                "Xác nhận từ admin"
                              )
                            }
                            disabled={actionLoading[payment._id]}
                          >
                            {actionLoading[payment._id] ? (
                              <FaSpinner className="spinning" />
                            ) : (
                              <FaCheck />
                            )}
                            Xác minh
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() =>
                              handleUpdatePaymentStatus(
                                payment._id,
                                "rejected",
                                "Từ chối từ admin"
                              )
                            }
                            disabled={actionLoading[payment._id]}
                          >
                            {actionLoading[payment._id] ? (
                              <FaSpinner className="spinning" />
                            ) : (
                              <FaTimes />
                            )}
                            Từ chối
                          </button>
                        </>
                      )}{" "}
                      {payment.status === "completed" &&
                        (payment.user || payment.order?.buyer) &&
                        payment.order?.seller && (
                          <>
                            {" "}
                            <button
                              className="btn-notification"
                              onClick={() => sendPaymentNotifications(payment)}
                              title="Gửi thông báo cho buyer và seller"
                              disabled={actionLoading[`notify_${payment._id}`]}
                            >
                              {actionLoading[`notify_${payment._id}`] ? (
                                <FaSpinner className="spinning" />
                              ) : (
                                <FaBell />
                              )}
                              Gửi thông báo
                            </button>{" "}
                            <button
                              className="btn-chat"
                              onClick={() => {
                                console.log(
                                  "Chat button clicked for payment:",
                                  payment
                                );
                                createPaymentChat(payment);
                              }}
                              title="Tạo cuộc trò chuyện"
                              disabled={actionLoading[`chat_${payment._id}`]}
                            >
                              {actionLoading[`chat_${payment._id}`] ? (
                                <FaSpinner className="spinning" />
                              ) : (
                                <FaComment />
                              )}
                              Tạo chat
                            </button>
                            <button
                              className="btn-transfer"
                              onClick={() => handleCreateTransferQR(payment)}
                              title="Tạo QR chuyển khoản cho seller"
                              disabled={actionLoading[`qr_${payment._id}`]}
                            >
                              {actionLoading[`qr_${payment._id}`] ? (
                                <FaSpinner className="spinning" />
                              ) : (
                                <FaMoneyBillWave />
                              )}
                              Giải ngân
                            </button>
                          </>
                        )}
                      <button
                        className="btn-view"
                        onClick={() => handleViewPaymentDetail(payment._id)}
                      >
                        <FaEye />
                        Chi tiết
                      </button>
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
      {/* QR Transfer Modal */}
      {showQRModal && qrData && (
        <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
          <div
            className="modal-content qr-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>QR Chuyển khoản cho Seller</h3>
              <button
                className="close-btn"
                onClick={() => setShowQRModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="qr-content">
                <div className="transfer-info">
                  <h4>Thông tin chuyển khoản</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Người nhận:</label>
                      <span>{qrData.seller.name}</span>
                    </div>
                    <div className="info-item">
                      <label>Ngân hàng:</label>
                      <span>{qrData.seller.bankInfo.bankName}</span>
                    </div>
                    <div className="info-item">
                      <label>Số tài khoản:</label>
                      <span>{qrData.seller.bankInfo.accountNumber}</span>
                    </div>
                    <div className="info-item">
                      <label>Chủ tài khoản:</label>
                      <span>{qrData.seller.bankInfo.accountHolder}</span>
                    </div>
                    <div className="info-item">
                      <label>Số tiền:</label>
                      <span className="amount">
                        {formatCurrency(qrData.payment.amount)}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Nội dung:</label>
                      <span>{qrData.transferContent}</span>
                    </div>
                  </div>
                </div>

                <div className="qr-section">
                  <h4>Mã QR chuyển khoản</h4>
                  <div className="qr-container">
                    {qrLoading ? (
                      <div className="qr-loading">
                        <FaSpinner className="spinning" />
                        <p>Đang tạo QR...</p>
                      </div>
                    ) : (
                      <>
                        <img
                          src={qrData.qrUrl}
                          alt="QR Code"
                          className="qr-image"
                          onError={(e) => {
                            console.error("Error loading QR image");
                            e.target.style.display = "none";
                          }}
                        />
                        <p className="qr-note">
                          Quét mã QR này bằng app ngân hàng để chuyển khoản cho
                          seller
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                {" "}
                <button
                  className="btn-primary"
                  onClick={() => {
                    // Copy QR URL or bank info
                    navigator.clipboard.writeText(qrData.qrUrl);
                    toast.success("📋 Đã copy link QR vào clipboard!");
                  }}
                >
                  📋 Copy QR Link
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setShowQRModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
              {selectedPayment.order.buyer && (
                <div className="detail-section">
                  <h4>Thông tin khách hàng</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Tên:</label>
                      <span>{selectedPayment.order.buyer.name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{selectedPayment.order.buyer.email}</span>
                    </div>
                    <div className="detail-item">
                      <label>Số điện thoại:</label>
                      <span>{selectedPayment.order.buyer.phone || "N/A"}</span>
                    </div>
                  </div>
                </div>
              )}{" "}
              {selectedPayment.order?.seller && (
                <div className="detail-section">
                  <h4>Thông tin người bán</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Tên:</label>
                      <span>{selectedPayment.order.seller.name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{selectedPayment.order.seller.email}</span>
                    </div>
                    <div className="detail-item">
                      <label>Số điện thoại:</label>
                      <span>{selectedPayment.order.seller.phone || "N/A"}</span>
                    </div>
                  </div>
                </div>
              )}
              {selectedPayment.order.car && (
                <div className="detail-section">
                  <h4>Thông tin xe</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>ID xe:</label>
                      <span>{selectedPayment.order.car._id}</span>
                    </div>
                    <div className="detail-item">
                      <label>Tên xe:</label>
                      <span>{selectedPayment.order.car.title}</span>
                    </div>
                    <div className="detail-item">
                      <label>Trạng thái xe:</label>
                      <span>{selectedPayment.order.car.status}</span>
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
            </div>{" "}
            <div className="modal-actions">
              {selectedPayment.status === "pending" && (
                <>
                  {" "}
                  <button
                    className="btn-approve"
                    onClick={() =>
                      handleUpdatePaymentStatus(
                        selectedPayment._id,
                        "completed",
                        "Xác nhận từ admin"
                      )
                    }
                    disabled={actionLoading[selectedPayment._id]}
                  >
                    {actionLoading[selectedPayment._id] ? (
                      <FaSpinner className="spinning" />
                    ) : (
                      <FaCheck />
                    )}
                    Xác minh thanh toán
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() =>
                      handleUpdatePaymentStatus(
                        selectedPayment._id,
                        "rejected",
                        "Từ chối từ admin"
                      )
                    }
                    disabled={actionLoading[selectedPayment._id]}
                  >
                    {actionLoading[selectedPayment._id] ? (
                      <FaSpinner className="spinning" />
                    ) : (
                      <FaTimes />
                    )}
                    Từ chối thanh toán
                  </button>
                </>
              )}{" "}
              {selectedPayment.status === "completed" &&
                (selectedPayment.user || selectedPayment.order?.buyer) &&
                selectedPayment.order?.seller && (
                  <>
                    {" "}
                    <button
                      className="btn-notification"
                      onClick={() => sendPaymentNotifications(selectedPayment)}
                      disabled={actionLoading[`notify_${selectedPayment._id}`]}
                    >
                      {actionLoading[`notify_${selectedPayment._id}`] ? (
                        <FaSpinner className="spinning" />
                      ) : (
                        <FaBell />
                      )}
                      Gửi thông báo
                    </button>{" "}
                    <button
                      className="btn-chat"
                      onClick={() => {
                        console.log(
                          "Chat button clicked in modal for payment:",
                          selectedPayment
                        );
                        createPaymentChat(selectedPayment);
                      }}
                      disabled={actionLoading[`chat_${selectedPayment._id}`]}
                    >
                      {actionLoading[`chat_${selectedPayment._id}`] ? (
                        <FaSpinner className="spinning" />
                      ) : (
                        <FaComment />
                      )}
                      Tạo chat
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
      )}{" "}
    </div>
  );
};

export default AdminPaymentManagement;
