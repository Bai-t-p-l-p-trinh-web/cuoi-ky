import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { userBankAPI } from "../../utils/axiosConfig";
import BankInfoForm from "../../components/user/BankInfoForm";
import "./BankInfoManagement.scss";

const BankInfoManagement = () => {
  const [bankInfo, setBankInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchBankInfo();
  }, []);
  const fetchBankInfo = async () => {
    try {
      setLoading(true);
      const response = await userBankAPI.get();
      setBankInfo(response.data);
    } catch (error) {
      console.error("Error fetching bank info:", error);
      // Bank info không tồn tại là bình thường
      setBankInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBankInfo = async (newBankInfo) => {
    try {
      await userBankAPI.update(newBankInfo);
      toast.success("Đã cập nhật thông tin ngân hàng thành công");
      setIsEditing(false);
      fetchBankInfo();
    } catch (error) {
      toast.error("Không thể cập nhật thông tin ngân hàng");
      console.error("Error updating bank info:", error);
    }
  };

  const getVerificationStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: "Chờ xác minh", color: "warning" },
      verified: { label: "Đã xác minh", color: "success" },
      rejected: { label: "Bị từ chối", color: "danger" },
    };

    const config = statusConfig[status] || {
      label: "Chưa xác minh",
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
        <p>Đang tải thông tin ngân hàng...</p>
      </div>
    );
  }

  return (
    <div className="bank-info-management">
      <div className="container">
        <h1>Quản lý thông tin ngân hàng</h1>

        <div className="info-section">
          <div className="section-header">
            <h2>Thông tin tài khoản ngân hàng</h2>
            <p>
              Thông tin này sẽ được sử dụng để nhận thanh toán khi bán xe và
              hoàn tiền khi cần thiết.
            </p>
          </div>

          {!bankInfo && !isEditing ? (
            <div className="empty-state">
              <div className="empty-icon">🏦</div>
              <h3>Chưa có thông tin ngân hàng</h3>
              <p>
                Bạn cần thêm thông tin ngân hàng để có thể bán xe và nhận thanh
                toán.
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary"
              >
                Thêm thông tin ngân hàng
              </button>
            </div>
          ) : isEditing ? (
            <div className="edit-form">
              <BankInfoForm
                initialData={bankInfo}
                onSave={handleSaveBankInfo}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          ) : (
            <div className="bank-info-card">
              <div className="card-header">
                <h3>Thông tin ngân hàng hiện tại</h3>
                <div className="header-actions">
                  {getVerificationStatusBadge(bankInfo.verificationStatus)}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-outline"
                  >
                    Chỉnh sửa
                  </button>
                </div>
              </div>

              <div className="card-content">
                <div className="info-grid">
                  <div className="info-item">
                    <label>Tên ngân hàng:</label>
                    <span>{bankInfo.bankName}</span>
                  </div>

                  <div className="info-item">
                    <label>Số tài khoản:</label>
                    <span>{bankInfo.accountNumber}</span>
                  </div>

                  <div className="info-item">
                    <label>Tên chủ tài khoản:</label>
                    <span>{bankInfo.accountHolderName}</span>
                  </div>

                  <div className="info-item">
                    <label>Chi nhánh:</label>
                    <span>{bankInfo.branch || "Không có"}</span>
                  </div>
                </div>

                {bankInfo.verificationStatus === "rejected" &&
                  bankInfo.rejectionReason && (
                    <div className="rejection-reason">
                      <h4>Lý do từ chối:</h4>
                      <p>{bankInfo.rejectionReason}</p>
                    </div>
                  )}
              </div>

              <div className="card-footer">
                <div className="update-info">
                  <small>
                    Cập nhật lần cuối:{" "}
                    {new Date(bankInfo.updatedAt).toLocaleString("vi-VN")}
                  </small>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="notice-section">
          <div className="notice-card">
            <h3>📋 Lưu ý quan trọng</h3>
            <ul>
              <li>Thông tin ngân hàng phải chính xác và thuộc về chính bạn</li>
              <li>Admin sẽ xác minh thông tin trước khi bạn có thể sử dụng</li>
              <li>
                Thông tin này sẽ được bảo mật và chỉ sử dụng cho mục đích thanh
                toán
              </li>
              <li>
                Bạn có thể cập nhật thông tin bất cứ lúc nào nhưng cần xác minh
                lại
              </li>
              <li>
                Nếu thông tin bị từ chối, vui lòng kiểm tra và cập nhật lại
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankInfoManagement;
