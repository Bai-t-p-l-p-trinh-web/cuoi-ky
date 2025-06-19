import React, { useState, useEffect } from "react";
import { paymentAPI } from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import PaymentDetailModal from "./PaymentDetailModal";
import "./AdminPaymentVerification.scss";

const AdminPaymentVerification = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    orderCode: "",
    paymentCode: "",
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchPendingPayments();
  }, [filters.page]);

  const fetchPendingPayments = async () => {
    setLoading(true);
    try {
      const response = await paymentAPI.getPending(filters);
      setPayments(response.data.payments);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    setFilters({ ...filters, page: 1 });
    fetchPendingPayments();
  };

  const verifyPayment = async (payment, transactionData) => {
    try {
      await paymentAPI.verify(payment._id, {
        bankTransactionId: transactionData.transactionId,
        transactionDate: transactionData.date || new Date(),
        evidence: transactionData.evidence || [],
        notes: transactionData.notes || "Đã xác minh qua sao kê ngân hàng",
      });

      toast.success("Đã xác minh thanh toán thành công!");
      fetchPendingPayments();
    } catch (error) {
      console.error("Error verifying payment:", error);
    }
  };

  const rejectPayment = async (payment, reason) => {
    try {
      await paymentAPI.reject(payment._id, {
        reason,
        notes: "Đã kiểm tra sao kê ngân hàng",
      });

      toast.success("Đã từ chối thanh toán!");
      fetchPendingPayments();
    } catch (error) {
      console.error("Error rejecting payment:", error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("vi-VN");
  };

  const getPaymentTypeText = (type) => {
    const types = {
      deposit: "Đặt cọc",
      final_payment: "Thanh toán cuối",
      full_payment: "Thanh toán toàn bộ",
    };
    return types[type] || type;
  };

  const handleVerifyClick = (payment) => {
    const transactionId = prompt("Nhập mã giao dịch từ sao kê ngân hàng:");
    if (transactionId) {
      const notes = prompt("Ghi chú (tùy chọn):") || "";
      verifyPayment(payment, {
        transactionId,
        date: new Date(),
        notes,
      });
    }
  };

  const handleRejectClick = (payment) => {
    const reason = prompt("Lý do từ chối:");
    if (reason) {
      rejectPayment(payment, reason);
    }
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  return (
    <div className="admin-payment-verification">
      <div className="page-header">
        <h2>Xác minh thanh toán</h2>
        <div className="stats">
          <span className="pending-count">
            {pagination.totalRecords || 0} thanh toán chờ xác minh
          </span>
        </div>
      </div>

      <div className="filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Mã đơn hàng (ORD...)"
            value={filters.orderCode}
            onChange={(e) =>
              setFilters({ ...filters, orderCode: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Mã thanh toán (PAY...)"
            value={filters.paymentCode}
            onChange={(e) =>
              setFilters({ ...filters, paymentCode: e.target.value })
            }
          />
          <button onClick={handleSearch} disabled={loading}>
            🔍 Tìm kiếm
          </button>
          <button onClick={fetchPendingPayments} disabled={loading}>
            🔄 Làm mới
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <>
          <div className="payments-list">
            {payments.length === 0 ? (
              <div className="empty-state">
                <p>Không có thanh toán nào chờ xác minh</p>
              </div>
            ) : (
              payments.map((payment) => (
                <div key={payment._id} className="payment-card">
                  <div className="payment-header">
                    <div className="payment-codes">
                      <h3>{payment.paymentCode}</h3>
                      <span className="order-code">
                        {payment.order.orderCode}
                      </span>
                      <span className={`payment-type ${payment.type}`}>
                        {getPaymentTypeText(payment.type)}
                      </span>
                    </div>
                    <div className="payment-amount">
                      {formatPrice(payment.amount)}
                    </div>
                  </div>

                  <div className="payment-info">
                    <div className="info-section">
                      <h4>Thông tin giao dịch</h4>
                      <div className="info-grid">
                        <div className="info-item">
                          <span>Người mua:</span>
                          <span>{payment.order.buyer.fullName}</span>
                        </div>
                        <div className="info-item">
                          <span>Người bán:</span>
                          <span>{payment.order.seller.fullName}</span>
                        </div>
                        <div className="info-item">
                          <span>Xe:</span>
                          <span>{payment.order.car.title}</span>
                        </div>
                        <div className="info-item">
                          <span>Tạo lúc:</span>
                          <span>{formatDate(payment.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="info-section">
                      <h4>Thông tin chuyển khoản</h4>
                      <div className="bank-info">
                        <div className="bank-detail">
                          <span>Ngân hàng:</span>
                          <span>{payment.qrCode?.bankName}</span>
                        </div>
                        <div className="bank-detail">
                          <span>Số TK:</span>
                          <span>{payment.qrCode?.accountNumber}</span>
                        </div>
                        <div className="bank-detail">
                          <span>Chủ TK:</span>
                          <span>{payment.qrCode?.accountName}</span>
                        </div>
                        <div className="bank-detail">
                          <span>Nội dung:</span>
                          <span className="transfer-content">
                            {payment.qrCode?.content}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="payment-actions">
                    <button
                      className="btn-detail"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowDetailModal(true);
                      }}
                    >
                      👁️ Chi tiết
                    </button>

                    <button
                      className="btn-verify"
                      onClick={() => handleVerifyClick(payment)}
                    >
                      ✅ Xác minh
                    </button>

                    <button
                      className="btn-reject"
                      onClick={() => handleRejectClick(payment)}
                    >
                      ❌ Từ chối
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {pagination.total > 1 && (
            <div className="pagination">
              <button
                disabled={pagination.current === 1}
                onClick={() => handlePageChange(pagination.current - 1)}
              >
                « Trước
              </button>

              <span className="page-info">
                Trang {pagination.current} / {pagination.total}
              </span>

              <button
                disabled={pagination.current === pagination.total}
                onClick={() => handlePageChange(pagination.current + 1)}
              >
                Sau »
              </button>
            </div>
          )}
        </>
      )}

      {showDetailModal && selectedPayment && (
        <PaymentDetailModal
          payment={selectedPayment}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedPayment(null);
          }}
          onVerify={(transactionData) => {
            verifyPayment(selectedPayment, transactionData);
            setShowDetailModal(false);
          }}
          onReject={(reason) => {
            rejectPayment(selectedPayment, reason);
            setShowDetailModal(false);
          }}
        />
      )}
    </div>
  );
};

export default AdminPaymentVerification;
