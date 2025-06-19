import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import apiClient from "../../utils/axiosConfig";
import { convertCurrency } from "../../utils/ConvertNumber";
import "./scss/TransactionTracker.scss";

function TransactionTracker({ transactionId, onClose }) {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nextSteps, setNextSteps] = useState([]);
  const [userRole, setUserRole] = useState(null); // 'buyer' or 'seller'
  const [canActions, setCanActions] = useState({});

  useEffect(() => {
    if (transactionId) {
      fetchTransactionStatus();
    }
  }, [transactionId]);

  const fetchTransactionStatus = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        `/payment/transaction/${transactionId}`
      );

      setTransaction(response.data.transaction);
      setNextSteps(response.data.nextSteps);
      setCanActions({
        canRefund: response.data.canRefund,
        canConfirm: response.data.canConfirm,
        isUserBuyer: response.data.isUserBuyer,
        isUserSeller: response.data.isUserSeller,
      });

      setUserRole(response.data.isUserBuyer ? "buyer" : "seller");
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    try {
      await apiClient.post("/payment/confirm-delivery", {
        transactionId: transactionId,
        role: userRole,
      });

      toast.success("Xác nhận thành công!");
      fetchTransactionStatus(); // Refresh status
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  const handleRequestRefund = async () => {
    const reason = prompt("Vui lòng nhập lý do hoàn tiền:");
    if (!reason) return;

    try {
      await apiClient.post("/payment/request-refund", {
        transactionId: transactionId,
        reason: reason,
      });

      toast.success("Yêu cầu hoàn tiền đã được gửi!");
      fetchTransactionStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  const handleSellerApproveRefund = async (approved) => {
    try {
      await apiClient.post("/payment/seller/approve-refund", {
        transactionId: transactionId,
        approved: approved,
      });

      toast.success(
        approved ? "Đã đồng ý hoàn tiền!" : "Đã từ chối hoàn tiền!"
      );
      fetchTransactionStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      pending_payment: "Chờ thanh toán",
      payment_confirmed: "Đã thanh toán",
      in_negotiation: "Đang thỏa thuận",
      awaiting_delivery: "Chờ giao hàng",
      buyer_confirmed: "Người mua đã xác nhận",
      seller_confirmed: "Người bán đã xác nhận",
      both_confirmed: "Đã xác nhận",
      completed: "Hoàn thành",
      refund_requested: "Yêu cầu hoàn tiền",
      refunded: "Đã hoàn tiền",
      cancelled: "Đã hủy",
      disputed: "Tranh chấp",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending_payment: "orange",
      payment_confirmed: "blue",
      in_negotiation: "purple",
      awaiting_delivery: "cyan",
      buyer_confirmed: "green",
      seller_confirmed: "green",
      both_confirmed: "darkgreen",
      completed: "green",
      refund_requested: "red",
      refunded: "gray",
      cancelled: "gray",
      disputed: "red",
    };
    return colorMap[status] || "black";
  };

  if (loading) {
    return <div className="transaction-tracker loading">Đang tải...</div>;
  }

  if (!transaction) {
    return (
      <div className="transaction-tracker error">Không tìm thấy giao dịch!</div>
    );
  }

  return (
    <div className="transaction-tracker-overlay">
      <div className="transaction-tracker">
        <div className="tracker-header">
          <h2>Theo dõi giao dịch</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="tracker-content">
          {/* Transaction Info */}
          <div className="transaction-info">
            <div className="info-row">
              <span>Mã giao dịch:</span>
              <strong>{transaction.transactionId}</strong>
            </div>
            <div className="info-row">
              <span>Xe:</span>
              <strong>{transaction.carTitle}</strong>
            </div>
            <div className="info-row">
              <span>Số tiền:</span>
              <strong>{convertCurrency(transaction.amount)}</strong>
            </div>
            <div className="info-row">
              <span>Loại:</span>
              <strong>
                {transaction.paymentType === "deposit"
                  ? "Đặt cọc"
                  : "Thanh toán toàn phần"}
              </strong>
            </div>
            <div className="info-row">
              <span>Trạng thái:</span>
              <strong style={{ color: getStatusColor(transaction.status) }}>
                {getStatusLabel(transaction.status)}
              </strong>
            </div>
          </div>

          {/* Contact Info */}
          <div className="contact-info">
            <h4>Thông tin liên hệ</h4>
            {userRole === "buyer" ? (
              <div>
                <p>
                  <strong>Người bán:</strong> {transaction.sellerName}
                </p>
                <p>
                  <strong>SĐT:</strong> {transaction.sellerId?.phone}
                </p>
              </div>
            ) : (
              <div>
                <p>
                  <strong>Người mua:</strong> {transaction.buyerName}
                </p>
                <p>
                  <strong>SĐT:</strong> {transaction.buyerId?.phone}
                </p>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="next-steps">
            <h4>Các bước tiếp theo:</h4>
            <ul>
              {nextSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="transaction-actions">
            {canActions.canConfirm && (
              <button
                className="action-btn confirm"
                onClick={handleConfirmDelivery}
              >
                {userRole === "buyer" ? "Xác nhận nhận xe" : "Xác nhận giao xe"}
              </button>
            )}

            {canActions.canRefund &&
              transaction.status !== "refund_requested" && (
                <button
                  className="action-btn refund"
                  onClick={handleRequestRefund}
                >
                  Yêu cầu hoàn tiền
                </button>
              )}

            {transaction.status === "refund_requested" &&
              userRole === "seller" && (
                <div className="refund-actions">
                  <p>
                    <strong>Lý do hoàn tiền:</strong> {transaction.refundReason}
                  </p>
                  <button
                    className="action-btn approve"
                    onClick={() => handleSellerApproveRefund(true)}
                  >
                    Đồng ý hoàn tiền
                  </button>
                  <button
                    className="action-btn reject"
                    onClick={() => handleSellerApproveRefund(false)}
                  >
                    Từ chối
                  </button>
                </div>
              )}
          </div>

          {/* Timeline */}
          <div className="transaction-timeline">
            <h4>Lịch sử giao dịch:</h4>
            <div className="timeline">
              <div className="timeline-item">
                <span className="time">
                  {new Date(transaction.createdAt).toLocaleString()}
                </span>
                <span className="event">Tạo giao dịch</span>
              </div>

              {transaction.paymentProof?.uploadedAt && (
                <div className="timeline-item">
                  <span className="time">
                    {new Date(
                      transaction.paymentProof.uploadedAt
                    ).toLocaleString()}
                  </span>
                  <span className="event">Upload bằng chứng thanh toán</span>
                </div>
              )}

              {transaction.paymentProof?.verifiedAt && (
                <div className="timeline-item">
                  <span className="time">
                    {new Date(
                      transaction.paymentProof.verifiedAt
                    ).toLocaleString()}
                  </span>
                  <span className="event">Admin xác nhận thanh toán</span>
                </div>
              )}

              {transaction.buyerConfirmedAt && (
                <div className="timeline-item">
                  <span className="time">
                    {new Date(transaction.buyerConfirmedAt).toLocaleString()}
                  </span>
                  <span className="event">Người mua xác nhận</span>
                </div>
              )}

              {transaction.sellerConfirmedAt && (
                <div className="timeline-item">
                  <span className="time">
                    {new Date(transaction.sellerConfirmedAt).toLocaleString()}
                  </span>
                  <span className="event">Người bán xác nhận</span>
                </div>
              )}

              {transaction.completedDate && (
                <div className="timeline-item">
                  <span className="time">
                    {new Date(transaction.completedDate).toLocaleString()}
                  </span>
                  <span className="event">Hoàn thành giao dịch</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionTracker;
