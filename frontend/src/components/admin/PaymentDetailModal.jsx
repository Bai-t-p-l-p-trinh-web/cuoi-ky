import React from "react";
import "./PaymentDetailModal.scss";

const PaymentDetailModal = ({
  payment,
  isOpen,
  onClose,
  onVerify,
  onReject,
  verifying,
}) => {
  if (!isOpen || !payment) return null;

  const handleVerify = () => {
    onVerify(payment._id);
  };

  const handleReject = () => {
    const reason = prompt("Nhập lý do từ chối:");
    if (reason) {
      onReject(payment._id, reason);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: "Chờ xử lý", color: "warning" },
      completed: { label: "Hoàn thành", color: "success" },
      failed: { label: "Thất bại", color: "danger" },
      cancelled: { label: "Đã hủy", color: "secondary" },
    };

    const config = statusConfig[status] || {
      label: status,
      color: "secondary",
    };
    return (
      <span className={`badge badge-${config.color}`}>{config.label}</span>
    );
  };

  return (
    <div className="payment-detail-modal">
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Chi tiết thanh toán</h2>
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="modal-body">
            <div className="payment-info">
              <div className="info-section">
                <h3>Thông tin cơ bản</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Mã thanh toán:</label>
                    <span>{payment.paymentCode}</span>
                  </div>
                  <div className="info-item">
                    <label>Mã đơn hàng:</label>
                    <span>{payment.order?.orderCode || "N/A"}</span>
                  </div>
                  <div className="info-item">
                    <label>Số tiền:</label>
                    <span className="amount">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Loại thanh toán:</label>
                    <span>{payment.type}</span>
                  </div>
                  <div className="info-item">
                    <label>Trạng thái:</label>
                    <span>{getStatusBadge(payment.status)}</span>
                  </div>
                  <div className="info-item">
                    <label>Ngày tạo:</label>
                    <span>
                      {new Date(payment.createdAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                </div>
              </div>

              {payment.order && (
                <div className="info-section">
                  <h3>Thông tin đơn hàng</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Xe:</label>
                      <span>{payment.order.car?.name || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <label>Người mua:</label>
                      <span>{payment.order.buyer?.name || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <label>Người bán:</label>
                      <span>{payment.order.seller?.name || "N/A"}</span>
                    </div>
                  </div>
                </div>
              )}

              {payment.qrCode && (
                <div className="info-section">
                  <h3>Thông tin QR Code</h3>
                  <div className="qr-info">
                    <div className="qr-image">
                      <img src={payment.qrCode.url} alt="QR Code" />
                    </div>
                    <div className="qr-details">
                      <div className="info-item">
                        <label>Ngân hàng:</label>
                        <span>{payment.qrCode.bankName}</span>
                      </div>
                      <div className="info-item">
                        <label>Số tài khoản:</label>
                        <span>{payment.qrCode.accountNumber}</span>
                      </div>
                      <div className="info-item">
                        <label>Chủ tài khoản:</label>
                        <span>{payment.qrCode.accountName}</span>
                      </div>
                      <div className="info-item">
                        <label>Nội dung:</label>
                        <span>{payment.qrCode.content}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {payment.transactionInfo && (
                <div className="info-section">
                  <h3>Thông tin giao dịch</h3>
                  <div className="info-grid">
                    {payment.transactionInfo.bankTransactionId && (
                      <div className="info-item">
                        <label>Mã giao dịch ngân hàng:</label>
                        <span>{payment.transactionInfo.bankTransactionId}</span>
                      </div>
                    )}
                    {payment.transactionInfo.bankCode && (
                      <div className="info-item">
                        <label>Mã ngân hàng:</label>
                        <span>{payment.transactionInfo.bankCode}</span>
                      </div>
                    )}
                    {payment.transactionInfo.transactionDate && (
                      <div className="info-item">
                        <label>Ngày giao dịch:</label>
                        <span>
                          {new Date(
                            payment.transactionInfo.transactionDate
                          ).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    )}
                    {payment.transactionInfo.verifiedBy && (
                      <div className="info-item">
                        <label>Được xác minh bởi:</label>
                        <span>{payment.transactionInfo.verifiedBy.name}</span>
                      </div>
                    )}
                    {payment.transactionInfo.verifiedAt && (
                      <div className="info-item">
                        <label>Thời gian xác minh:</label>
                        <span>
                          {new Date(
                            payment.transactionInfo.verifiedAt
                          ).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    )}
                  </div>

                  {payment.transactionInfo.evidence &&
                    payment.transactionInfo.evidence.length > 0 && (
                      <div className="evidence-section">
                        <label>Chứng từ thanh toán:</label>
                        <div className="evidence-images">
                          {payment.transactionInfo.evidence.map(
                            (url, index) => (
                              <div key={index} className="evidence-item">
                                <img
                                  src={url}
                                  alt={`Chứng từ ${index + 1}`}
                                  onClick={() => window.open(url, "_blank")}
                                />
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            {payment.status === "pending" && (
              <>
                <button
                  className="btn btn-success"
                  onClick={handleVerify}
                  disabled={verifying}
                >
                  {verifying ? "Đang xác minh..." : "Xác minh thanh toán"}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleReject}
                  disabled={verifying}
                >
                  Từ chối
                </button>
              </>
            )}
            <button className="btn btn-secondary" onClick={onClose}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailModal;
