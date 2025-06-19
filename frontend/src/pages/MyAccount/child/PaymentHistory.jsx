import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import apiClient from "../../../utils/axiosConfig";
import { convertCurrency } from "../../../utils/ConvertNumber";
import "./scss/PaymentHistory.scss";

function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all', 'buyer', 'seller'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentHistory();
  }, [filter]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const params = filter !== "all" ? { type: filter } : {};
      const response = await apiClient.get("/payment/history", { params });
      setPayments(response.data);
    } catch (error) {
      toast.error("Không thể tải lịch sử giao dịch!");
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: "Đang chờ",
      deposited: "Đã đặt cọc",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
      refunded: "Đã hoàn tiền",
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const classMap = {
      pending: "status-pending",
      deposited: "status-deposited",
      completed: "status-completed",
      cancelled: "status-cancelled",
      refunded: "status-refunded",
    };
    return classMap[status] || "";
  };

  const getPaymentTypeText = (type) => {
    return type === "deposit" ? "Đặt cọc" : "Thanh toán đầy đủ";
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="payment-history">
      <div className="payment-history__header">
        <h2>Lịch sử giao dịch</h2>
        <div className="payment-history__filters">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            Tất cả
          </button>
          <button
            className={filter === "buyer" ? "active" : ""}
            onClick={() => setFilter("buyer")}
          >
            Mua xe
          </button>
          <button
            className={filter === "seller" ? "active" : ""}
            onClick={() => setFilter("seller")}
          >
            Bán xe
          </button>
        </div>
      </div>

      <div className="payment-history__content">
        {payments.length === 0 ? (
          <div className="empty-state">
            <p>Chưa có giao dịch nào</p>
          </div>
        ) : (
          <div className="payment-list">
            {payments.map((payment) => (
              <div key={payment._id} className="payment-item">
                <div className="payment-item__header">
                  <span className="transaction-id">
                    #{payment.transactionId}
                  </span>
                  <span className={`status ${getStatusClass(payment.status)}`}>
                    {getStatusText(payment.status)}
                  </span>
                </div>

                <div className="payment-item__content">
                  <div className="car-info">
                    <h4>{payment.carTitle}</h4>
                    <p className="payment-type">
                      {getPaymentTypeText(payment.paymentType)}
                    </p>
                  </div>

                  <div className="payment-details">
                    <div className="amount">
                      <span className="label">Số tiền:</span>
                      <span className="value">
                        {convertCurrency(payment.amount)}
                      </span>
                    </div>

                    <div className="date">
                      <span className="label">Ngày:</span>
                      <span className="value">
                        {new Date(payment.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {payment.note && (
                  <div className="payment-item__note">
                    <small>{payment.note}</small>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentHistory;
