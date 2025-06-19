import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { orderAPI } from "../../utils/axiosConfig";
import "./OrderManagement.scss";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getUserOrders();
      let filteredOrders = response.data;

      if (filter !== "all") {
        filteredOrders = response.data.filter(
          (order) => order.status === filter
        );
      }

      setOrders(filteredOrders);
    } catch (error) {
      toast.error("Không thể tải danh sách đơn hàng");
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReceived = async (orderId) => {
    try {
      await orderAPI.confirmReceived(orderId);
      toast.success("Đã xác nhận nhận xe thành công");
      fetchOrders();
    } catch (error) {
      toast.error("Không thể xác nhận nhận xe");
      console.error("Error confirming received:", error);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      return;
    }

    try {
      await orderAPI.updateOrderStatus(orderId, { status: "cancelled" });
      toast.success("Đã hủy đơn hàng thành công");
      fetchOrders();
    } catch (error) {
      toast.error("Không thể hủy đơn hàng");
      console.error("Error cancelling order:", error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: "Chờ xử lý", color: "warning" },
      payment_pending: { label: "Chờ thanh toán", color: "info" },
      confirmed: { label: "Đã xác nhận", color: "success" },
      in_transit: { label: "Đang giao", color: "primary" },
      delivered: { label: "Đã giao", color: "success" },
      completed: { label: "Hoàn thành", color: "success" },
      cancelled: { label: "Đã hủy", color: "danger" },
      refund_requested: { label: "Yêu cầu hoàn tiền", color: "warning" },
      refunded: { label: "Đã hoàn tiền", color: "info" },
    };

    const config = statusConfig[status] || {
      label: status,
      color: "secondary",
    };
    return (
      <span className={`badge badge-${config.color}`}>{config.label}</span>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải danh sách đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="order-management">
      <div className="container">
        <h1>Quản lý đơn hàng</h1>

        <div className="filter-section">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả đơn hàng</option>
            <option value="pending">Chờ xử lý</option>
            <option value="payment_pending">Chờ thanh toán</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="in_transit">Đang giao</option>
            <option value="delivered">Đã giao</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
            <option value="refund_requested">Yêu cầu hoàn tiền</option>
            <option value="refunded">Đã hoàn tiền</option>
          </select>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <p>Không có đơn hàng nào</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <h3>Đơn hàng #{order._id.slice(-8)}</h3>
                  {getStatusBadge(order.status)}
                </div>

                <div className="order-info">
                  <div className="car-info">
                    <h4>{order.car.name}</h4>
                    <p>
                      Năm: {order.car.year} | Giá:{" "}
                      {order.totalAmount.toLocaleString()} VNĐ
                    </p>
                  </div>

                  <div className="order-details">
                    <p>
                      <strong>Phương thức thanh toán:</strong>{" "}
                      {order.paymentMethod}
                    </p>
                    <p>
                      <strong>Ngày tạo:</strong>{" "}
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                    {order.deliveryDate && (
                      <p>
                        <strong>Ngày giao dự kiến:</strong>{" "}
                        {new Date(order.deliveryDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {order.contractUrl && (
                  <div className="contract-section">
                    <a
                      href={order.contractUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline"
                    >
                      Xem hợp đồng
                    </a>
                  </div>
                )}

                <div className="order-actions">
                  {order.status === "delivered" && (
                    <button
                      onClick={() => handleConfirmReceived(order._id)}
                      className="btn btn-success"
                    >
                      Xác nhận đã nhận xe
                    </button>
                  )}

                  {["pending", "payment_pending"].includes(order.status) && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="btn btn-danger"
                    >
                      Hủy đơn hàng
                    </button>
                  )}

                  {order.status === "completed" && (
                    <button
                      onClick={() =>
                        (window.location.href = `/refund/${order._id}`)
                      }
                      className="btn btn-warning"
                    >
                      Yêu cầu hoàn tiền
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
