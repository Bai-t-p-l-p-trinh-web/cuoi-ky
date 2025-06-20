import React, { useState } from "react";
import { orderAPI } from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import QRCodeModal from "./QRCodeModal";
import { createQRData } from "../../utils/vietqr";
import "./CreateOrderForm.scss";

const CreateOrderForm = ({ car, onOrderCreated, onClose }) => {
  const [formData, setFormData] = useState({
    paymentMethod: "deposit",
    depositPercentage: 20,
  });
  const [loading, setLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("=== FRONTEND GỌI API ===");
      console.log("Data gửi đi:", {
        carId: car._id,
        paymentMethod: formData.paymentMethod,
        depositPercentage: formData.depositPercentage,
      });

      // Tính toán số tiền thanh toán
      const paymentAmount =
        formData.paymentMethod === "deposit"
          ? car.price * (parseInt(formData.depositPercentage) / 100)
          : car.price;

      // Tạo orderCode unique
      const orderCode = `ORD${Date.now()}`;
      const paymentCode = `PAY${Date.now()}`;

      // Tạo orderData ngay lập tức để render QR
      const immediateOrderData = {
        order: {
          _id: `temp_${Date.now()}`,
          orderCode: orderCode,
          totalAmount: car.price,
          depositAmount:
            formData.paymentMethod === "deposit" ? paymentAmount : 0,
          remainingAmount:
            formData.paymentMethod === "deposit"
              ? car.price - paymentAmount
              : 0,
          paymentMethod: formData.paymentMethod,
          car: car,
          status: "awaiting_payment",
        },
        payment: {
          _id: `temp_pay_${Date.now()}`,
          paymentCode: paymentCode,
          amount: paymentAmount,
          type:
            formData.paymentMethod === "deposit" ? "deposit" : "full_payment",
          status: "pending",
        },
        qrCode: createQRData(
          paymentAmount,
          orderCode,
          formData.paymentMethod === "deposit" ? "deposit" : "full_payment"
        ),
        nextStep: "payment",
      };

      // Hiển thị UI ngay lập tức
      if (formData.paymentMethod !== "direct_transaction") {
        toast.success("Đơn hàng đã được tạo! Vui lòng thanh toán.");
        setOrderData(immediateOrderData);
        setShowQRModal(true);
      } else {
        toast.success("Đơn hàng đã được tạo! Vui lòng liên hệ người bán.");
        onOrderCreated(immediateOrderData);
      }

      // Gọi API tạo order thật ở background (không await)
      orderAPI
        .create({
          carId: car._id,
          paymentMethod: formData.paymentMethod,
          depositPercentage: parseInt(formData.depositPercentage),
        })
        .then((response) => {
          console.log("✅ Background API thành công:", response);
          // Cập nhật với data thật nếu cần
          if (response?.data && showQRModal) {
            setOrderData((prevData) => ({
              ...prevData,
              order: { ...prevData.order, ...response.data.order },
              payment: { ...prevData.payment, ...response.data.payment },
              // Giữ QR code cũ hoặc update nếu backend trả về QR mới
              qrCode: response.data.qrCode || prevData.qrCode,
            }));
          }
        })
        .catch((error) => {
          console.error("❌ Background API lỗi:", error);
          // Không làm gì, user vẫn có thể dùng với data đã tạo
        });
    } catch (error) {
      console.error("Error creating order:", error);

      // Kiểm tra lỗi seller chưa có thông tin ngân hàng
      if (error.response?.data?.sellerBankNotConfigured) {
        toast.error(
          "Người bán chưa cập nhật thông tin ngân hàng. Vui lòng chọn phương thức 'Giao dịch trực tiếp' hoặc liên hệ người bán.",
          { autoClose: 5000 }
        );
        // Tự động chuyển sang giao dịch trực tiếp
        setFormData({ ...formData, paymentMethod: "direct_transaction" });
      } else {
        toast.error(error.response?.data?.message || "Không thể tạo đơn hàng");
      }
    }

    setLoading(false);
  };

  const handleQRSuccess = () => {
    setShowQRModal(false);
    onOrderCreated(orderData);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const calculateAmount = () => {
    if (formData.paymentMethod === "deposit") {
      return car.price * (formData.depositPercentage / 100);
    } else if (formData.paymentMethod === "full_payment") {
      return car.price;
    }
    return 0;
  };
  console.log("Car data:", car);
  console.log("Car ID:", car?._id);
  console.log("Form data being sent:", {
    carId: car?._id,
    paymentMethod: formData.paymentMethod,
    depositPercentage: formData.depositPercentage,
  });
  return (
    <>
      <div className="create-order-form">
        <div className="form-header">
          <h3>Tạo đơn hàng</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="car-info">
          <img src={car.img_src[0]} alt={car.title} />
          <div className="car-details">
            <h4>{car.title}</h4>
            <p className="price">{formatPrice(car.price)}</p>
            <p className="location">{car.location?.query_name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Phương thức thanh toán:</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) =>
                setFormData({ ...formData, paymentMethod: e.target.value })
              }
              required
            >
              <option value="deposit">Đặt cọc trước</option>
              <option value="full_payment">Thanh toán toàn bộ</option>
              <option value="direct_transaction">Giao dịch trực tiếp</option>
            </select>
          </div>

          {formData.paymentMethod === "deposit" && (
            <div className="form-group">
              <label>Tỷ lệ đặt cọc (%):</label>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={formData.depositPercentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    depositPercentage: e.target.value,
                  })
                }
              />
              <div className="percentage-display">
                {formData.depositPercentage}% = {formatPrice(calculateAmount())}
              </div>
            </div>
          )}

          {formData.paymentMethod !== "direct_transaction" && (
            <div className="payment-info">
              <h4>Thông tin thanh toán:</h4>
              <div className="payment-details">
                <div className="detail-row">
                  <span>Tổng giá xe:</span>
                  <span>{formatPrice(car.price)}</span>
                </div>
                <div className="detail-row">
                  <span>Số tiền cần thanh toán:</span>
                  <span className="highlight">
                    {formatPrice(calculateAmount())}
                  </span>
                </div>
                {formData.paymentMethod === "deposit" && (
                  <div className="detail-row">
                    <span>Còn lại:</span>
                    <span>{formatPrice(car.price - calculateAmount())}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {formData.paymentMethod === "direct_transaction" && (
            <div className="direct-transaction-note">
              <p>🤝 Bạn sẽ giao dịch trực tiếp với người bán</p>
              <p>💰 Thanh toán khi nhận xe</p>
              <p>
                📞 Vui lòng liên hệ người bán để thống nhất địa điểm giao dịch
              </p>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Hủy
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo đơn hàng"}
            </button>
          </div>
        </form>
      </div>

      {showQRModal && orderData && (
        <QRCodeModal
          orderData={orderData}
          onSuccess={handleQRSuccess}
          onClose={() => setShowQRModal(false)}
        />
      )}
    </>
  );
};

export default CreateOrderForm;
