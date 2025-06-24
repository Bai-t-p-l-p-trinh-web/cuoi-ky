import React from "react";
import "./PaymentSuccessModal.scss";

const PaymentSuccessModal = ({ orderData, onClose }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="payment-success-overlay">
      <div className="payment-success-modal">
        <div className="success-header">
          <div className="success-icon">✅</div>
          <h2>Thanh toán thành công!</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="success-content">
          <div className="order-info">
            <h3>Thông tin đơn hàng</h3>
            <div className="info-row">
              <span>Mã đơn hàng:</span>
              <span className="highlight">
                {orderData.order?.orderCode || orderData.order?._id}
              </span>
            </div>
            <div className="info-row">
              <span>Tên xe:</span>
              <span>
                {orderData.order?.car?.title || orderData.order?.car?.name}
              </span>
            </div>
            <div className="info-row">
              <span>Số tiền đã thanh toán:</span>
              <span className="highlight">
                {formatPrice(orderData.payment?.amount || 0)}
              </span>
            </div>
            {orderData.order?.remainingAmount > 0 && (
              <div className="info-row">
                <span>Còn lại:</span>
                <span>{formatPrice(orderData.order.remainingAmount)}</span>
              </div>
            )}
          </div>

          <div className="next-steps">
            <h3>Các bước tiếp theo</h3>
            <div className="step">
              <span className="step-number">1</span>
              <div className="step-content">
                <h4>Chờ admin xác minh thanh toán</h4>
                <p>
                  Admin sẽ kiểm tra và xác minh thanh toán của bạn trong vòng 30
                  phút.
                </p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <div className="step-content">
                <h4>Nhận thông báo xác minh</h4>
                <p>
                  Bạn sẽ nhận được thông báo khi thanh toán được xác minh thành
                  công.
                </p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <div className="step-content">
                <h4>Trao đổi với người bán</h4>
                <p>
                  Sau khi thanh toán được xác minh, hệ thống sẽ hướng dẫn bạn
                  liên hệ với người bán để giao xe.
                </p>
              </div>
            </div>
          </div>

          <div className="contact-info">
            <h3>Cần hỗ trợ?</h3>
            <p>Nếu có bất kỳ vấn đề gì, vui lòng liên hệ:</p>
            <div className="contact-methods">
              <div className="contact-item">📞 Hotline: 1900-xxxx</div>
              <div className="contact-item">📧 Email: support@FakeAuto.com</div>
            </div>
          </div>
        </div>

        <div className="success-actions">
          <button className="primary-btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessModal;
