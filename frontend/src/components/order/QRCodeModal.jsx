import React, { useState, useEffect } from "react";
import { orderAPI } from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import "./QRCodeModal.scss";
import PaymentSuccessModal from "./PaymentSuccessModal";

const QRCodeModal = ({ orderData, onSuccess, onClose }) => {
  if (!orderData || !orderData.order) {
    return (
      <div className="qr-modal-overlay">
        <div className="qr-modal">
          <div className="modal-header">
            <h3>Đang tải...</h3>
            <button className="close-btn" onClick={onClose}>
              ×
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(1800);

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

    // Validate payment ID
    if (!orderData?.payment?._id) {
      toast.error(
        "Không tìm thấy thông tin thanh toán. Vui lòng tạo lại đơn hàng."
      );
      console.error("Missing payment ID:", orderData);
      return;
    }

    setLoading(true);
    try {
      const paymentData = {
        paymentId: orderData.payment._id,
        transactionId: transactionId.trim(),
        evidence: evidence,
      };

      const response = await orderAPI.confirmPayment(paymentData);
      console.log("Payment confirmed successfully:", response.data);

      toast.success(
        "Xác nhận thanh toán thành công! Vui lòng chờ admin xác minh."
      );
      setPaymentConfirmed(true);
    } catch (error) {
      console.error("Error confirming payment:", error);

      let errorMessage = "Lỗi khi xác nhận thanh toán";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors
          .map((err) => err.msg)
          .join(", ");
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép!");
  };

  const downloadQR = () => {
    const link = document.createElement("a");
    link.href = orderData.qrCode.qrDataURL;
    link.download = `QR_${
      orderData.order?.orderCode || orderData.order._id
    }.png`;
    link.click();
  };
  if (paymentConfirmed) {
    return <PaymentSuccessModal orderData={orderData} onClose={onClose} />;
  }

  return (
    <div className="qr-modal-overlay">
      <div className="qr-modal">
        <div className="modal-header">
          <h3>
            Thanh toán đơn hàng{" "}
            {orderData.order?.orderCode || orderData.order._id}
          </h3>
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
              {" "}
              <div className="info-row amount">
                <span>Số tiền:</span>
                <span>{formatPrice(orderData.payment.amount)}</span>
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
              </div>{" "}
              <div className="info-row transfer-content">
                <span>Nội dung chuyển khoản:</span>
                <span className="transfer-text">
                  {orderData.qrCode.content ||
                    orderData.qrCode.description ||
                    `THANH TOAN ${
                      orderData.order?.orderCode || orderData.order._id
                    }`}
                  <button
                    className="copy-btn"
                    onClick={() =>
                      copyToClipboard(
                        orderData.qrCode.content ||
                          orderData.qrCode.description ||
                          `THANH TOAN ${
                            orderData.order?.orderCode || orderData.order._id
                          }`
                      )
                    }
                  >
                    📋
                  </button>
                </span>
              </div>
            </div>
          </div>{" "}
          <div className="instructions">
            <h4>Hướng dẫn thanh toán:</h4>
            <ol>
              <li>Mở app ngân hàng và quét QR code</li>
              <li>Kiểm tra thông tin và số tiền</li>
              <li>
                <strong>Quan trọng:</strong> Nhập đúng nội dung chuyển khoản bên
                trên
              </li>
              <li>Thực hiện chuyển khoản</li>
              <li>Nhập mã giao dịch bên dưới để xác nhận</li>
            </ol>
            <div className="transfer-note">
              <p>
                💡 <strong>Lưu ý:</strong> Nội dung chuyển khoản phải chính xác
                để hệ thống có thể xác nhận thanh toán tự động.
              </p>
            </div>{" "}
          </div>
          <div className="payment-confirmation">
            <div className="confirmation-section">
              <h4>Xác nhận đã thanh toán</h4>
              <div className="form-group">
                <label>Mã giao dịch từ ngân hàng:</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="VD: MB20231218123456"
                  required
                />
              </div>

              <button
                className="confirm-btn"
                onClick={handleConfirmPayment}
                disabled={loading || !transactionId.trim()}
              >
                {loading ? "Đang xử lý..." : "Xác nhận đã thanh toán"}
              </button>
            </div>

            <div className="confirmation-section">
              <h4>Ảnh chứng từ thanh toán</h4>
              <div className="form-group">
                <label>Link ảnh chứng từ (tùy chọn):</label>
                <input
                  type="text"
                  placeholder="Dán link ảnh chứng từ thanh toán"
                  onChange={(e) => {
                    if (e.target.value) {
                      setEvidence([e.target.value]);
                    } else {
                      setEvidence([]);
                    }
                  }}
                />
                <div className="file-hint">
                  💡 Upload ảnh lên Imgur hoặc Google Drive rồi dán link vào đây
                </div>
              </div>
            </div>
          </div>
          <div className="warning">
            <p>
              ⚠️{" "}
              <strong>
                Vui lòng thanh toán đúng số tiền và nội dung chuyển khoản
              </strong>
            </p>
            <p>
              📋 Nhấn nút sao chép (📋) bên cạnh nội dung chuyển khoản để copy
              chính xác
            </p>
            <p>💡 Admin sẽ xác minh thanh toán trong vòng 24h</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
