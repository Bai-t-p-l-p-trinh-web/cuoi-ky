import React, { useState, useEffect } from "react";
import { orderAPI } from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import "./QRCodeModal.scss";

const QRCodeModal = ({ orderData, onSuccess, onClose }) => {
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(1800); // 30 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.warning("QR code đã hết hạn. Vui lòng tạo đơn hàng mới.");
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleConfirmPayment = async () => {
    if (!transactionId.trim()) {
      toast.error("Vui lòng nhập mã giao dịch");
      return;
    }

    setLoading(true);
    try {
      await orderAPI.confirmPayment({
        paymentId: orderData.payment._id,
        transactionId: transactionId.trim(),
        evidence: evidence,
      });

      toast.success(
        "Xác nhận thanh toán thành công! Vui lòng chờ admin xác minh."
      );
      setPaymentConfirmed(true);

      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error) {
      console.error("Error confirming payment:", error);
    }
    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép!");
  };

  const downloadQR = () => {
    const link = document.createElement("a");
    link.href = orderData.qrCode.qrDataURL;
    link.download = `QR_${orderData.order.orderCode}.png`;
    link.click();
  };

  if (paymentConfirmed) {
    return (
      <div className="qr-modal-overlay">
        <div className="qr-modal success">
          <div className="success-content">
            <div className="success-icon">✅</div>
            <h3>Xác nhận thanh toán thành công!</h3>
            <p>Đơn hàng {orderData.order.orderCode} đang chờ admin xác minh.</p>
            <p>Bạn sẽ nhận được thông báo khi thanh toán được xác nhận.</p>
            <button onClick={onSuccess}>Đóng</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="qr-modal-overlay">
      <div className="qr-modal">
        <div className="modal-header">
          <h3>Thanh toán đơn hàng {orderData.order.orderCode}</h3>
          <div className="countdown">
            Hết hạn sau: <span>{formatTime(countdown)}</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="qr-section">
            <div className="qr-code">
              <img src={orderData.qrCode.qrDataURL} alt="QR Code" />
              <button className="download-qr" onClick={downloadQR}>
                📥 Tải QR
              </button>
            </div>

            <div className="payment-info">
              <div className="info-row">
                <span>Số tiền:</span>
                <span className="amount">
                  {formatPrice(orderData.payment.amount)}
                </span>
              </div>
              <div className="info-row">
                <span>Ngân hàng:</span>
                <span>{orderData.qrCode.bankName}</span>
              </div>
              <div className="info-row">
                <span>Số tài khoản:</span>
                <span>
                  {orderData.qrCode.accountNumber}
                  <button
                    className="copy-btn"
                    onClick={() =>
                      copyToClipboard(orderData.qrCode.accountNumber)
                    }
                  >
                    📋
                  </button>
                </span>
              </div>
              <div className="info-row">
                <span>Chủ tài khoản:</span>
                <span>{orderData.qrCode.accountName}</span>
              </div>
              <div className="info-row">
                <span>Nội dung:</span>
                <span>
                  {orderData.qrCode.description}
                  <button
                    className="copy-btn"
                    onClick={() =>
                      copyToClipboard(orderData.qrCode.description)
                    }
                  >
                    📋
                  </button>
                </span>
              </div>
            </div>
          </div>

          <div className="instructions">
            <h4>Hướng dẫn thanh toán:</h4>
            <ol>
              <li>Mở app ngân hàng và quét QR code</li>
              <li>Kiểm tra thông tin và số tiền</li>
              <li>Thực hiện chuyển khoản</li>
              <li>Nhập mã giao dịch bên dưới để xác nhận</li>
            </ol>
          </div>

          <div className="confirmation-section">
            <h4>Xác nhận đã thanh toán</h4>
            <div className="form-group">
              <label>Mã giao dịch từ ngân hàng:</label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Nhập mã giao dịch (VD: MB20231218123456)"
                required
              />
            </div>

            <div className="form-group">
              <label>Ảnh chứng từ (tùy chọn):</label>
              <input
                type="text"
                placeholder="Link ảnh chứng từ thanh toán"
                onChange={(e) => {
                  if (e.target.value) {
                    setEvidence([e.target.value]);
                  } else {
                    setEvidence([]);
                  }
                }}
              />
              <small>
                Có thể upload ảnh lên Imgur hoặc Google Drive và dán link
              </small>
            </div>

            <button
              className="confirm-btn"
              onClick={handleConfirmPayment}
              disabled={loading || !transactionId.trim()}
            >
              {loading ? "Đang xác nhận..." : "Xác nhận đã thanh toán"}
            </button>
          </div>

          <div className="warning">
            <p>⚠️ Vui lòng thanh toán đúng số tiền và nội dung chuyển khoản</p>
            <p>💡 Admin sẽ xác minh thanh toán trong vòng 24h</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
