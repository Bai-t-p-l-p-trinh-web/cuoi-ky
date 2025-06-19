import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import apiClient from "../../utils/axiosConfig";
import { convertCurrency } from "../../utils/ConvertNumber";
import TransactionTracker from "../../components/TransactionTracker";
import "./scss/TransactionHistory.scss";

function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    role: "all", // all, buyer, seller
    status: "", // empty for all statuses
    page: 1,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filter.role !== "all") {
        params.append("role", filter.role);
      }
      if (filter.status) {
        params.append("status", filter.status);
      }
      params.append("page", filter.page);
      params.append("limit", 10);

      const response = await apiClient.get(
        `/payment/my-transactions?${params}`
      );

      setTransactions(response.data.transactions);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilter((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filter changes
    }));
  };

  const handlePageChange = (newPage) => {
    setFilter((prev) => ({ ...prev, page: newPage }));
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      pending_payment: "Chờ thanh toán",
      payment_confirmed: "Đã thanh toán",
      in_negotiation: "Đang thỏa thuận",
      awaiting_delivery: "Chờ giao hàng",
      buyer_confirmed: "Người mua đã xác nhận",
      seller_confirmed: "Người bán đã xác nhận",
      both_confirmed: "Đã xác nhận",
      completed: "Hoàn thành",
      refund_requested: "Yêu cầu hoàn tiền",
      refunded: "Đã hoàn tiền",
      cancelled: "Đã hủy",
      disputed: "Tranh chấp",
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const classMap = {
      pending_payment: "status-pending",
      payment_confirmed: "status-confirmed",
      in_negotiation: "status-negotiation",
      awaiting_delivery: "status-delivery",
      buyer_confirmed: "status-confirmed",
      seller_confirmed: "status-confirmed",
      both_confirmed: "status-confirmed",
      completed: "status-completed",
      refund_requested: "status-refund",
      refunded: "status-refunded",
      cancelled: "status-cancelled",
      disputed: "status-disputed",
    };
    return classMap[status] || "status-default";
  };

  if (loading) {
    return <div className="transaction-history loading">Đang tải...</div>;
  }

  return (
    <div className="transaction-history">
      <div className="page-header">
        <h1>Lịch sử giao dịch</h1>
        <p>Theo dõi tất cả các giao dịch mua bán xe của bạn</p>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>Vai trò:</label>
          <select
            value={filter.role}
            onChange={(e) => handleFilterChange("role", e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="buyer">Người mua</option>
            <option value="seller">Người bán</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Trạng thái:</label>
          <select
            value={filter.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="pending_payment">Chờ thanh toán</option>
            <option value="in_negotiation">Đang thỏa thuận</option>
            <option value="completed">Hoàn thành</option>
            <option value="refunded">Đã hoàn tiền</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="transactions-list">
        {transactions.length === 0 ? (
          <div className="no-transactions">
            <p>Không có giao dịch nào</p>
          </div>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction._id} className="transaction-card">
              <div className="transaction-info">
                <div className="car-info">
                  <img
                    src={
                      transaction.carId?.img_src?.[0] ||
                      transaction.carId?.img_src ||
                      "/placeholder-car.jpg"
                    }
                    alt={transaction.carTitle}
                    className="car-image"
                  />
                  <div className="car-details">
                    <h3>{transaction.carTitle}</h3>
                    <p className="price">
                      {convertCurrency(transaction.amount)}
                    </p>
                    <p className="payment-type">
                      {transaction.paymentType === "deposit"
                        ? "Đặt cọc"
                        : "Thanh toán toàn phần"}
                    </p>
                  </div>
                </div>

                <div className="transaction-meta">
                  <div className="meta-item">
                    <span className="label">Mã GD:</span>
                    <span className="value">{transaction.transactionId}</span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Ngày tạo:</span>
                    <span className="value">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Trạng thái:</span>
                    <span
                      className={`status ${getStatusClass(transaction.status)}`}
                    >
                      {getStatusLabel(transaction.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="transaction-actions">
                <button
                  className="btn-track"
                  onClick={() =>
                    setSelectedTransactionId(transaction.transactionId)
                  }
                >
                  Theo dõi
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={pagination.currentPage === 1}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
          >
            Trước
          </button>

          <span>
            Trang {pagination.currentPage} / {pagination.totalPages}
          </span>

          <button
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
          >
            Sau
          </button>
        </div>
      )}

      {/* Transaction Tracker Modal */}
      {selectedTransactionId && (
        <TransactionTracker
          transactionId={selectedTransactionId}
          onClose={() => setSelectedTransactionId(null)}
        />
      )}
    </div>
  );
}

export default TransactionHistory;
