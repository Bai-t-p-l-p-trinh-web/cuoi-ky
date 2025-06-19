import React, { useState } from "react";
import { toast } from "react-toastify";
import apiClient from "../../utils/axiosConfig";
import { convertCurrency } from "../../utils/ConvertNumber";
import "./scss/PaymentModal.scss";

function PaymentModal({ car, isOpen, onClose, onSuccess }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: Chọn thanh toán, 2: QR Payment, 3: Upload proof, 4: Waiting confirmation
  const [paymentType, setPaymentType] = useState("deposit"); // 'deposit' or 'full'
  const [transactionData, setTransactionData] = useState(null);
  const [paymentProof, setPaymentProof] = useState(null);

  if (!isOpen || !car) return null;

  const depositAmount = Math.max(car.price * 0.1, 5);
  const fullAmount = car.price;

  const handleStartPayment = async (type) => {
    setIsProcessing(true);
    try {
      const response = await apiClient.post("/payment/initiate", {
        carSlug: car.slug,
        paymentType: type,
        amount: type === "deposit" ? depositAmount : fullAmount,
      });

      setTransactionData(response.data.transaction);
      setPaymentType(type);
      setStep(2); // Move to QR payment step

      toast.success("Giao dịch đã được tạo. Vui lòng thanh toán theo QR code.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadProof = async () => {
    if (!paymentProof) {
      toast.error("Vui lòng tải lên bằng chứng thanh toán!");
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("paymentProof", paymentProof);
      formData.append("transactionId", transactionData.transactionId);

      const response = await apiClient.post("/payment/upload-proof", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStep(4); // Move to waiting confirmation
      toast.success("Đã tải lên bằng chứng thanh toán. Vui lòng chờ xác nhận!");
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="payment-modal__header">
          <h2>Thanh toán mua xe</h2>
          <button className="payment-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="payment-modal__content">
          {/* Thông tin xe */}
          <div className="payment-modal__car-info">
            <img src={car.img_src?.[0] || car.img_src} alt={car.title} />
            <div>
              <h3>{car.title}</h3>
              <p className="price">Giá: {convertCurrency(car.price)}</p>
            </div>
          </div>

          {/* Bước 1: Chọn hình thức thanh toán */}
          {step === 1 && (
            <div className="payment-modal__step">
              <h4>Chọn hình thức thanh toán</h4>

              <div className="payment-options">
                <div className="payment-option">
                  <h5>Đặt cọc (Khuyến nghị)</h5>
                  <div className="payment-info">
                    <div className="payment-row">
                      <span>Số tiền cọc (10%, tối thiểu 5 triệu):</span>
                      <strong>{convertCurrency(depositAmount)}</strong>
                    </div>
                    <div className="payment-row">
                      <span>Số tiền còn lại (thanh toán sau):</span>
                      <strong>
                        {convertCurrency(car.price - depositAmount)}
                      </strong>
                    </div>
                  </div>
                  <div className="payment-benefits">
                    <p>
                      <strong>Ưu điểm:</strong>
                    </p>
                    <ul>
                      <li>Bảo toàn tiền cọc trong hệ thống</li>
                      <li>Thỏa thuận vận chuyển với người bán</li>
                      <li>Thanh toán phần còn lại khi nhận xe</li>
                      <li>Có thể hủy và nhận lại tiền cọc trước khi giao xe</li>
                    </ul>
                  </div>
                  <button
                    className="payment-btn primary"
                    onClick={() => handleStartPayment("deposit")}
                    disabled={isProcessing}
                  >
                    Đặt cọc {convertCurrency(depositAmount)}
                  </button>
                </div>

                <div className="payment-option">
                  <h5>Thanh toán toàn phần</h5>
                  <div className="payment-info">
                    <div className="payment-row">
                      <span>Tổng số tiền:</span>
                      <strong>{convertCurrency(fullAmount)}</strong>
                    </div>
                  </div>
                  <div className="payment-benefits">
                    <p>
                      <strong>Ưu điểm:</strong>
                    </p>
                    <ul>
                      <li>Hoàn tất thanh toán một lần</li>
                      <li>Tiền được giữ an toàn trong hệ thống</li>
                      <li>
                        Chuyển cho người bán khi cả hai xác nhận giao dịch
                      </li>
                    </ul>
                  </div>
                  <button
                    className="payment-btn secondary"
                    onClick={() => handleStartPayment("full")}
                    disabled={isProcessing}
                  >
                    Thanh toán {convertCurrency(fullAmount)}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bước 2: QR Code Payment */}
          {step === 2 && transactionData && (
            <div className="payment-modal__step">
              <h4>Thanh toán qua QR Code</h4>

              <div className="qr-payment-section">
                <div className="transaction-info">
                  <div className="info-row">
                    <span>Mã giao dịch:</span>
                    <strong>{transactionData.transactionId}</strong>
                  </div>
                  <div className="info-row">
                    <span>Số tiền:</span>
                    <strong>{convertCurrency(transactionData.amount)}</strong>
                  </div>
                  <div className="info-row">
                    <span>Nội dung chuyển khoản:</span>
                    <strong>COCCOC {transactionData.transactionId}</strong>
                  </div>
                </div>

                <div className="qr-code-container">
                  <img
                    src={transactionData.qrCodeUrl}
                    alt="QR Code thanh toán"
                    className="qr-code"
                  />
                  <p className="qr-instruction">
                    Quét mã QR bằng app ngân hàng của bạn
                  </p>
                </div>

                <div className="bank-info">
                  <h5>Hoặc chuyển khoản thủ công:</h5>
                  <div className="bank-details">
                    <div>STK: {transactionData.bankAccount?.accountNumber}</div>
                    <div>
                      Ngân hàng: {transactionData.bankAccount?.bankName}
                    </div>
                    <div>
                      Chủ TK: {transactionData.bankAccount?.accountHolder}
                    </div>
                  </div>
                </div>

                <div className="payment-note">
                  <p>
                    <strong>Quan trọng:</strong>
                  </p>
                  <ul>
                    <li>
                      Vui lòng chuyển đúng số tiền:{" "}
                      <strong>{convertCurrency(transactionData.amount)}</strong>
                    </li>
                    <li>
                      Nội dung CK:{" "}
                      <strong>COCCOC {transactionData.transactionId}</strong>
                    </li>
                    <li>
                      Sau khi chuyển, hãy chụp ảnh màn hình giao dịch thành công
                    </li>
                  </ul>
                </div>

                <button
                  className="payment-btn primary"
                  onClick={() => setStep(3)}
                >
                  Đã chuyển khoản, tiếp tục →
                </button>
              </div>
            </div>
          )}

          {/* Bước 3: Upload proof */}
          {step === 3 && (
            <div className="payment-modal__step">
              <h4>Tải lên bằng chứng thanh toán</h4>

              <div className="upload-proof-section">
                <p>Vui lòng tải lên ảnh chụp màn hình giao dịch thành công:</p>

                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPaymentProof(e.target.files[0])}
                    className="file-input"
                  />
                  {paymentProof && (
                    <div className="file-preview">
                      <p>Đã chọn: {paymentProof.name}</p>
                    </div>
                  )}
                </div>

                <div className="proof-requirements">
                  <p>
                    <strong>Yêu cầu ảnh:</strong>
                  </p>
                  <ul>
                    <li>Ảnh rõ nét, đầy đủ thông tin giao dịch</li>
                    <li>
                      Hiển thị số tiền chuyển:{" "}
                      {convertCurrency(transactionData.amount)}
                    </li>
                    <li>
                      Hiển thị nội dung: COCCOC {transactionData.transactionId}
                    </li>
                    <li>Hiển thị trạng thái "Thành công"</li>
                  </ul>
                </div>

                <div className="action-buttons">
                  <button
                    className="payment-btn secondary"
                    onClick={() => setStep(2)}
                  >
                    ← Quay lại QR
                  </button>
                  <button
                    className="payment-btn primary"
                    onClick={handleUploadProof}
                    disabled={!paymentProof || isProcessing}
                  >
                    {isProcessing ? "Đang xử lý..." : "Gửi bằng chứng"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bước 4: Waiting confirmation */}
          {step === 4 && (
            <div className="payment-modal__step">
              <h4>Chờ xác nhận thanh toán</h4>

              <div className="waiting-confirmation">
                <div className="status-icon">⏳</div>
                <p>Bằng chứng thanh toán đã được gửi thành công!</p>
                <p>Admin sẽ xác nhận trong vòng 2-4 giờ làm việc.</p>
                <div className="next-steps">
                  <h5>Các bước tiếp theo:</h5>
                  <ol>
                    <li>Admin xác nhận thanh toán</li>
                    <li>Người bán sẽ liên hệ với bạn</li>
                    <li>Thỏa thuận về vận chuyển/giao nhận</li>
                    <li>Xác nhận giao dịch hoàn tất</li>
                    <li>Hệ thống giải ngân cho người bán</li>
                  </ol>
                </div>{" "}
                <div className="contact-info">
                  <p>
                    <strong>Bạn có thể theo dõi tiến trình tại:</strong>
                  </p>
                  <p>Tài khoản → Lịch sử giao dịch</p>
                </div>
                <div className="action-buttons">
                  <button
                    className="payment-btn secondary"
                    onClick={() =>
                      window.open(`/transaction-history`, "_blank")
                    }
                  >
                    Xem lịch sử giao dịch
                  </button>
                  <button className="payment-btn primary" onClick={onClose}>
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
