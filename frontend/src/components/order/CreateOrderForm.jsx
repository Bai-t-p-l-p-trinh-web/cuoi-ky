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
      const response = await orderAPI.create({
        carId: car._id,
        paymentMethod: formData.paymentMethod,
        depositPercentage: parseInt(formData.depositPercentage),
      });

      if (formData.paymentMethod === "direct_transaction") {
        toast.success("Đơn hàng đã được tạo! Vui lòng liên hệ người bán.");
        onOrderCreated(response.data);
      } else {
        toast.success("Đơn hàng đã được tạo! Vui lòng thanh toán.");
        setOrderData(response.data.data);
        setShowQRModal(true);
      }
    } catch (error) {
      console.error("Error creating order:", error);

      if (error.response?.data?.sellerBankNotConfigured) {
        toast.error(
          "Người bán chưa cập nhật thông tin ngân hàng. Vui lòng chọn phương thức 'Giao dịch trực tiếp' hoặc liên hệ người bán.",
          { autoClose: 5000 }
        );
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
