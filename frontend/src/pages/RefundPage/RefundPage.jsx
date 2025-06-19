import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { orderAPI } from "../../utils/axiosConfig";
import RefundRequestForm from "../../components/refund/RefundRequestForm";
import "./RefundPage.scss";

const RefundPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrderById(orderId);
      setOrder(response.data);

      // Kiểm tra xem đơn hàng có thể hoàn tiền không
      if (response.data.status !== "completed") {
        toast.error("Chỉ có thể yêu cầu hoàn tiền cho đơn hàng đã hoàn thành");
        navigate("/orders");
        return;
      }
    } catch (error) {
      toast.error("Không thể tải thông tin đơn hàng");
      console.error("Error fetching order:", error);
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleRefundSuccess = () => {
    toast.success("Đã gửi yêu cầu hoàn tiền thành công");
    navigate("/orders");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="error-container">
        <h2>Không tìm thấy đơn hàng</h2>
        <button onClick={() => navigate("/orders")} className="btn btn-primary">
          Quay lại danh sách đơn hàng
        </button>
      </div>
    );
  }

  return (
    <div className="refund-page">
      <div className="container">
        <div className="page-header">
          <button onClick={() => navigate("/orders")} className="back-button">
            ← Quay lại
          </button>
          <h1>Yêu cầu hoàn tiền</h1>
        </div>

        <div className="order-summary">
          <h2>Thông tin đơn hàng</h2>
          <div className="order-info">
            <div className="info-row">
              <span className="label">Mã đơn hàng:</span>
              <span className="value">#{order._id.slice(-8)}</span>
            </div>
            <div className="info-row">
              <span className="label">Xe:</span>
              <span className="value">{order.car.name}</span>
            </div>
            <div className="info-row">
              <span className="label">Tổng tiền:</span>
              <span className="value">
                {order.totalAmount.toLocaleString()} VNĐ
              </span>
            </div>
            <div className="info-row">
              <span className="label">Ngày mua:</span>
              <span className="value">
                {new Date(order.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Phương thức thanh toán:</span>
              <span className="value">{order.paymentMethod}</span>
            </div>
          </div>
        </div>

        <div className="refund-form-section">
          <RefundRequestForm
            order={order}
            onSuccess={handleRefundSuccess}
            onCancel={() => navigate("/orders")}
          />
        </div>
      </div>
    </div>
  );
};

export default RefundPage;
