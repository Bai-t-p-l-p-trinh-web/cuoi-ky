import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { orderAPI } from "../../utils/axiosConfig";
import "./PaymentFlowTracker.scss";

const PaymentFlowTracker = ({ orderId, userRole }) => {
  const [flowData, setFlowData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingData, setMeetingData] = useState({
    location: "",
    time: "",
    notes: "",
  });

  useEffect(() => {
    if (orderId) {
      fetchFlowStatus();
    }
  }, [orderId]);

  const fetchFlowStatus = async () => {
    try {
      setLoading(true);
      // Giả sử có endpoint để lấy payment của order
      const response = await orderAPI.get(`/${orderId}/payment-flow`);
      setFlowData(response.data.data);
    } catch (error) {
      console.error("Fetch flow status error:", error);
      toast.error("Lỗi khi tải trạng thái thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleMeeting = async () => {
    try {
      if (!meetingData.location || !meetingData.time) {
        toast.error("Vui lòng nhập đầy đủ thông tin cuộc gặp");
        return;
      }

      await orderAPI.post(
        `/payments/order/${orderId}/schedule-meeting`,
        meetingData
      );
      toast.success("Đã sắp xếp cuộc gặp thành công");
      setShowMeetingModal(false);
      fetchFlowStatus();
    } catch (error) {
      console.error("Schedule meeting error:", error);
      toast.error("Lỗi khi sắp xếp cuộc gặp");
    }
  };

  const handleConfirmExchange = async (confirmed = true) => {
    try {
      await orderAPI.post(`/payments/order/${orderId}/confirm-exchange`, {
        confirmed,
      });
      toast.success(
        confirmed
          ? "Đã xác nhận trao đổi thành công"
          : "Đã báo cáo vấn đề trao đổi"
      );
      fetchFlowStatus();
    } catch (error) {
      console.error("Confirm exchange error:", error);
      toast.error("Lỗi khi xác nhận trao đổi");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("vi-VN");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return <div className="loading">Đang tải trạng thái thanh toán...</div>;
  }

  if (!flowData) {
    return <div className="no-data">Không tìm thấy thông tin thanh toán</div>;
  }

  const { payment, flowSteps } = flowData;

  return (
    <div className="payment-flow-tracker">
      <div className="header">
        <h3>Trạng thái thanh toán</h3>
        <div className="payment-info">
          <span className="amount">{formatPrice(payment.amount)}</span>
          <span className="type">{payment.type}</span>
        </div>
      </div>

      <div className="flow-steps">
        {flowSteps.map((step, index) => (
          <div
            key={step.step}
            className={`step ${step.status} ${
              step.completed ? "completed" : ""
            }`}
          >
            <div className="step-number">{step.step}</div>
            <div className="step-content">
              <h4>{step.name}</h4>

              {step.step === 1 && step.completed && (
                <div className="step-detail">
                  <p className="success">✅ Admin đã xác nhận nhận tiền</p>
                  {step.completedAt && (
                    <small>Xác nhận lúc: {formatDate(step.completedAt)}</small>
                  )}
                </div>
              )}

              {step.step === 2 && step.completed && (
                <div className="step-detail">
                  <p className="success">✅ Đã thông báo cho cả hai bên</p>
                </div>
              )}

              {step.step === 3 && (
                <div className="step-detail">
                  {step.meetingScheduled ? (
                    <div className="meeting-info">
                      <p className="success">✅ Cuộc gặp đã được sắp xếp</p>
                      <p>
                        <strong>Địa điểm:</strong>{" "}
                        {payment.exchangeInfo?.meetingLocation}
                      </p>
                      <p>
                        <strong>Thời gian:</strong>{" "}
                        {formatDate(payment.exchangeInfo?.meetingTime)}
                      </p>
                      {payment.exchangeInfo?.notes && (
                        <p>
                          <strong>Ghi chú:</strong> {payment.exchangeInfo.notes}
                        </p>
                      )}
                    </div>
                  ) : step.status === "current" ? (
                    <div className="meeting-actions">
                      <p>Vui lòng sắp xếp cuộc gặp để trao đổi xe</p>
                      <button
                        className="btn btn-primary"
                        onClick={() => setShowMeetingModal(true)}
                      >
                        Sắp xếp cuộc gặp
                      </button>
                    </div>
                  ) : (
                    <p className="pending">Chờ sắp xếp cuộc gặp</p>
                  )}
                </div>
              )}

              {step.step === 4 && (
                <div className="step-detail">
                  {step.completed ? (
                    <div className="exchange-completed">
                      <p className="success">✅ Trao đổi đã hoàn tất</p>
                      <div className="confirmations">
                        <p>
                          Buyer xác nhận: {step.buyerConfirmed ? "✅" : "❌"}
                        </p>
                        <p>
                          Seller xác nhận: {step.sellerConfirmed ? "✅" : "❌"}
                        </p>
                      </div>
                    </div>
                  ) : step.status === "current" ? (
                    <div className="exchange-actions">
                      <p>Sau khi trao đổi xe, vui lòng xác nhận:</p>
                      <div className="confirmation-status">
                        <p>
                          Buyer đã xác nhận: {step.buyerConfirmed ? "✅" : "❌"}
                        </p>
                        <p>
                          Seller đã xác nhận:{" "}
                          {step.sellerConfirmed ? "✅" : "❌"}
                        </p>
                      </div>

                      {(userRole === "buyer" && !step.buyerConfirmed) ||
                      (userRole === "seller" && !step.sellerConfirmed) ? (
                        <div className="action-buttons">
                          <button
                            className="btn btn-success"
                            onClick={() => handleConfirmExchange(true)}
                          >
                            Xác nhận trao đổi thành công
                          </button>
                          <button
                            className="btn btn-warning"
                            onClick={() => handleConfirmExchange(false)}
                          >
                            Báo cáo vấn đề
                          </button>
                        </div>
                      ) : (
                        <p className="waiting">Chờ đối tác xác nhận...</p>
                      )}
                    </div>
                  ) : (
                    <p className="pending">Chờ trao đổi xe</p>
                  )}
                </div>
              )}

              {step.step === 5 && (
                <div className="step-detail">
                  {step.completed ? (
                    <div className="transfer-completed">
                      <p className="success">✅ Đã chuyển tiền cho seller</p>
                      <p>
                        <strong>Số tiền:</strong>{" "}
                        {formatPrice(step.transferAmount)}
                      </p>
                      {step.completedAt && (
                        <small>
                          Chuyển lúc: {formatDate(step.completedAt)}
                        </small>
                      )}
                    </div>
                  ) : step.status === "current" ? (
                    <p className="current">Admin đang xử lý chuyển tiền...</p>
                  ) : (
                    <p className="pending">Chờ admin chuyển tiền</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Meeting Modal */}
      {showMeetingModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h4>Sắp xếp cuộc gặp</h4>
              <button
                className="close-btn"
                onClick={() => setShowMeetingModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Địa điểm gặp:</label>
                <input
                  type="text"
                  value={meetingData.location}
                  onChange={(e) =>
                    setMeetingData({ ...meetingData, location: e.target.value })
                  }
                  className="form-control"
                  placeholder="Nhập địa điểm gặp"
                  required
                />
              </div>

              <div className="form-group">
                <label>Thời gian:</label>
                <input
                  type="datetime-local"
                  value={meetingData.time}
                  onChange={(e) =>
                    setMeetingData({ ...meetingData, time: e.target.value })
                  }
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label>Ghi chú:</label>
                <textarea
                  value={meetingData.notes}
                  onChange={(e) =>
                    setMeetingData({ ...meetingData, notes: e.target.value })
                  }
                  className="form-control"
                  rows="3"
                  placeholder="Thêm ghi chú cho cuộc gặp..."
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowMeetingModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleScheduleMeeting}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentFlowTracker;
