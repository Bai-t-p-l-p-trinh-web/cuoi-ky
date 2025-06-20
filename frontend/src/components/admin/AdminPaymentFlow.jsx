import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { adminAPI } from "../../utils/axiosConfig";
import "./AdminPaymentFlow.scss";

const AdminPaymentFlow = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const statusLabels = {
    pending: "Chờ xác nhận",
    admin_confirmed: "Đã xác nhận nhận tiền",
    buyer_seller_notified: "Đã thông báo",
    exchange_in_progress: "Đang trao đổi",
    exchange_completed: "Hoàn tất trao đổi",
    completed: "Đã hoàn thành",
  };

  const statusColors = {
    pending: "warning",
    admin_confirmed: "info",
    buyer_seller_notified: "primary",
    exchange_in_progress: "secondary",
    exchange_completed: "success",
    completed: "success",
  };

  useEffect(() => {
    fetchPayments();
  }, [selectedStatus]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.get(
        `/payments/status?status=${selectedStatus}`
      );
      setPayments(response.data.data.payments);
    } catch (error) {
      console.error("Fetch payments error:", error);
      toast.error("Lỗi khi tải danh sách thanh toán");
    } finally {
      setLoading(false);
    }
  };
  const handleAdminConfirm = async (paymentId, data) => {
    try {
      await adminAPI.patch(`/payments/${paymentId}/admin-confirm`, data);
      toast.success("Đã xác nhận nhận tiền");
      fetchPayments();
      setShowModal(false);
    } catch (error) {
      console.error("Admin confirm error:", error);
      toast.error("Lỗi khi xác nhận thanh toán");
    }
  };

  const handleRejectPayment = async (paymentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn từ chối thanh toán này?"))
      return;

    try {
      await adminAPI.patch(`/payments/${paymentId}/reject`, {
        reason: "Từ chối từ admin",
        notes: "Thanh toán không hợp lệ",
      });
      toast.success("Đã từ chối thanh toán");
      fetchPayments();
    } catch (error) {
      console.error("Reject payment error:", error);
      toast.error("Lỗi khi từ chối thanh toán");
    }
  };

  const handleNotifyUsers = async (paymentId) => {
    try {
      await adminAPI.post(`/payments/${paymentId}/notify-users`);
      toast.success("Đã thông báo cho buyer và seller");
      fetchPayments();
    } catch (error) {
      console.error("Notify users error:", error);
      toast.error("Lỗi khi gửi thông báo");
    }
  };

  const handleTransferToSeller = async (paymentId, data) => {
    try {
      await adminAPI.post(`/payments/${paymentId}/transfer-to-seller`, data);
      toast.success("Đã chuyển tiền cho seller");
      fetchPayments();
      setShowModal(false);
    } catch (error) {
      console.error("Transfer error:", error);
      toast.error("Lỗi khi chuyển tiền");
    }
  };
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("vi-VN");
  };

  return (
    <div className="admin-payment-flow">
      <div className="header">
        <h2>Quản lý Payment Flow</h2>
        <div className="status-filter">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="form-select"
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <div className="payments-table">
          <table className="table">
            <thead>
              <tr>
                <th>Mã đơn hàng</th>
                <th>Người chuyển</th>
                <th>Mã giao dịch</th>
                <th>Lời nhắn</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td>
                    <strong>{payment.order.orderCode}</strong>
                    <br />
                    <small>{payment.paymentCode}</small>
                  </td>
                  <td>
                    <div>
                      <strong>
                        {payment.transactionInfo?.payerName ||
                          payment.order.buyer.fullName ||
                          "N/A"}
                      </strong>
                      <br />
                      <small>{payment.order.buyer.email}</small>
                    </div>
                  </td>
                  <td>
                    <div>
                      <strong>
                        {payment.transactionInfo?.bankTransactionId || "N/A"}
                      </strong>
                    </div>
                  </td>
                  <td>
                    <div>
                      <small>
                        {payment.transactionInfo?.transferMessage ||
                          payment.qrCode?.content ||
                          `THANH TOAN ${payment.order.orderCode}`}
                      </small>
                    </div>
                  </td>
                  <td>
                    <strong>{formatPrice(payment.amount)}</strong>
                    <br />
                    <small className="text-muted">{payment.type}</small>
                  </td>
                  <td>
                    <span
                      className={`badge badge-${statusColors[payment.status]}`}
                    >
                      {statusLabels[payment.status]}
                    </span>
                  </td>
                  <td>
                    <small>{formatDate(payment.createdAt)}</small>
                  </td>{" "}
                  <td>
                    {payment.status === "pending" && (
                      <div className="action-buttons">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() =>
                            handleAdminConfirm(payment._id, {
                              notes: "Xác nhận từ admin",
                            })
                          }
                        >
                          Xác nhận
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRejectPayment(payment._id)}
                        >
                          Từ chối
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {payments.length === 0 && (
            <div className="no-data">Không có thanh toán nào</div>
          )}
        </div>
      )}

      {/* Modal for actions */}
      {showModal && selectedPayment && (
        <PaymentActionModal
          payment={selectedPayment}
          onClose={() => {
            setShowModal(false);
            setSelectedPayment(null);
          }}
          onConfirm={handleAdminConfirm}
          onTransfer={handleTransferToSeller}
        />
      )}
    </div>
  );
};

const PaymentActionModal = ({ payment, onClose, onConfirm, onTransfer }) => {
  const [formData, setFormData] = useState({
    notes: "",
    transactionId: "",
    amount: payment.amount,
    reference: "",
    evidence: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (payment.status === "pending") {
      onConfirm(payment._id, {
        notes: formData.notes,
        transactionInfo: {
          bankTransactionId: formData.transactionId,
        },
      });
    } else if (payment.status === "exchange_completed") {
      onTransfer(payment._id, {
        amount: formData.amount,
        reference: formData.reference,
        notes: formData.notes,
        evidence: formData.evidence,
      });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>
            {payment.status === "pending"
              ? "Xác nhận nhận tiền"
              : "Chuyển tiền cho seller"}
          </h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="payment-info">
            <h4>Thông tin thanh toán</h4>
            <p>
              <strong>Đơn hàng:</strong> {payment.order.orderCode}
            </p>
            <p>
              <strong>Buyer:</strong> {payment.order.buyer.fullName}
            </p>
            <p>
              <strong>Seller:</strong> {payment.order.seller.fullName}
            </p>
            <p>
              <strong>Số tiền:</strong> {formatPrice(payment.amount)}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {payment.status === "pending" && (
              <>
                <div className="form-group">
                  <label>Mã giao dịch ngân hàng:</label>
                  <input
                    type="text"
                    value={formData.transactionId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transactionId: e.target.value,
                      })
                    }
                    className="form-control"
                    placeholder="Nhập mã giao dịch"
                  />
                </div>
              </>
            )}

            {payment.status === "exchange_completed" && (
              <>
                <div className="form-group">
                  <label>Số tiền chuyển:</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mã tham chiếu:</label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) =>
                      setFormData({ ...formData, reference: e.target.value })
                    }
                    className="form-control"
                    placeholder="Mã tham chiếu chuyển khoản"
                  />
                </div>

                {payment.order.seller.bankAccount && (
                  <div className="seller-bank-info">
                    <h5>Thông tin ngân hàng seller:</h5>
                    <p>
                      <strong>Tên tài khoản:</strong>{" "}
                      {payment.order.seller.bankAccount.accountName}
                    </p>
                    <p>
                      <strong>Số tài khoản:</strong>{" "}
                      {payment.order.seller.bankAccount.accountNumber}
                    </p>
                    <p>
                      <strong>Ngân hàng:</strong>{" "}
                      {payment.order.seller.bankAccount.bankName}
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="form-group">
              <label>Ghi chú:</label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="form-control"
                rows="3"
                placeholder="Thêm ghi chú..."
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Hủy
              </button>
              <button type="submit" className="btn btn-primary">
                {payment.status === "pending" ? "Xác nhận" : "Chuyển tiền"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentFlow;
