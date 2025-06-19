import React, { useState, useEffect } from "react";
import { userBankAPI } from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import "./BankInfoForm.scss";

const BankInfoForm = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    bankName: "",
    bankCode: "",
    accountNumber: "",
    accountHolder: "",
  });
  const [loading, setLoading] = useState(false);
  const [currentBankInfo, setCurrentBankInfo] = useState(null);

  const bankOptions = [
    { code: "970422", name: "MB Bank" },
    { code: "970407", name: "Techcombank" },
    { code: "970415", name: "Vietinbank" },
    { code: "970436", name: "Vietcombank" },
    { code: "970405", name: "Agribank" },
    { code: "970418", name: "BIDV" },
    { code: "970432", name: "VPBank" },
    { code: "970403", name: "Sacombank" },
    { code: "970448", name: "OCB" },
    { code: "970441", name: "VIB" },
  ];

  useEffect(() => {
    fetchCurrentBankInfo();
  }, []);

  const fetchCurrentBankInfo = async () => {
    try {
      const response = await userBankAPI.get();
      if (response.data.bankInfo) {
        const bankInfo = response.data.bankInfo;
        setCurrentBankInfo(bankInfo);
        setFormData({
          bankName: bankInfo.bankName || "",
          bankCode: bankInfo.bankCode || "",
          accountNumber: bankInfo.accountNumber || "",
          accountHolder: bankInfo.accountHolder || "",
        });
      }
    } catch (error) {
      // Bank info not found - this is OK for first time setup
      console.log("No bank info found:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await userBankAPI.update(formData);

      toast.success("Cập nhật thông tin ngân hàng thành công!");
      if (onSuccess) {
        onSuccess(response.data.bankInfo);
      }
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error updating bank info:", error);
    }

    setLoading(false);
  };

  const handleBankChange = (bankCode) => {
    const selectedBank = bankOptions.find((bank) => bank.code === bankCode);
    setFormData({
      ...formData,
      bankCode,
      bankName: selectedBank ? selectedBank.name : "",
    });
  };

  const validateAccountNumber = (value) => {
    // Basic validation - adjust based on requirements
    return /^\d{6,20}$/.test(value);
  };

  const validateAccountHolder = (value) => {
    // Should be uppercase Vietnamese name
    return /^[A-Z\s]+$/.test(value) && value.length >= 2;
  };

  return (
    <div className="bank-info-form">
      <div className="form-header">
        <h3>
          {currentBankInfo
            ? "Cập nhật thông tin ngân hàng"
            : "Thêm thông tin ngân hàng"}
        </h3>
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        )}
      </div>

      {currentBankInfo && (
        <div className="current-info">
          <h4>Thông tin hiện tại:</h4>
          <div className="info-display">
            <div className="info-row">
              <span>Ngân hàng:</span>
              <span>{currentBankInfo.bankName}</span>
            </div>
            <div className="info-row">
              <span>Số tài khoản:</span>
              <span>{currentBankInfo.accountNumber}</span>
            </div>
            <div className="info-row">
              <span>Chủ tài khoản:</span>
              <span>{currentBankInfo.accountHolder}</span>
            </div>
            <div className="info-row">
              <span>Trạng thái:</span>
              <span
                className={`status ${
                  currentBankInfo.isVerified ? "verified" : "pending"
                }`}
              >
                {currentBankInfo.isVerified
                  ? "✅ Đã xác minh"
                  : "⏳ Chờ xác minh"}
              </span>
            </div>
            {currentBankInfo.verifiedAt && (
              <div className="info-row">
                <span>Xác minh lúc:</span>
                <span>
                  {new Date(currentBankInfo.verifiedAt).toLocaleString("vi-VN")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Ngân hàng *</label>
          <select
            value={formData.bankCode}
            onChange={(e) => handleBankChange(e.target.value)}
            required
          >
            <option value="">-- Chọn ngân hàng --</option>
            {bankOptions.map((bank) => (
              <option key={bank.code} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Số tài khoản *</label>
          <input
            type="text"
            value={formData.accountNumber}
            onChange={(e) =>
              setFormData({
                ...formData,
                accountNumber: e.target.value.replace(/\D/g, ""),
              })
            }
            placeholder="Nhập số tài khoản (6-20 số)"
            maxLength="20"
            required
          />
          {formData.accountNumber &&
            !validateAccountNumber(formData.accountNumber) && (
              <small className="error">Số tài khoản phải từ 6-20 chữ số</small>
            )}
        </div>

        <div className="form-group">
          <label>Chủ tài khoản *</label>
          <input
            type="text"
            value={formData.accountHolder}
            onChange={(e) =>
              setFormData({
                ...formData,
                accountHolder: e.target.value.toUpperCase(),
              })
            }
            placeholder="NGUYEN VAN A (viết hoa, đúng như trên thẻ)"
            required
          />
          {formData.accountHolder &&
            !validateAccountHolder(formData.accountHolder) && (
              <small className="error">
                Tên chủ TK phải viết hoa, chỉ gồm chữ cái và khoảng trắng
              </small>
            )}
        </div>

        <div className="info-note">
          <h4>📝 Lưu ý quan trọng:</h4>
          <ul>
            <li>Thông tin ngân hàng phải chính xác 100%</li>
            <li>
              Tên chủ tài khoản phải viết HOA và đúng như trên thẻ ngân hàng
            </li>
            <li>Admin sẽ xác minh thông tin trong vòng 24h</li>
            <li>Thông tin đã xác minh mới được sử dụng cho giao dịch</li>
            <li>Chỉ tài khoản của chính bạn mới được chấp nhận</li>
          </ul>
        </div>

        <div className="form-actions">
          {onClose && (
            <button type="button" onClick={onClose} disabled={loading}>
              Hủy
            </button>
          )}
          <button
            type="submit"
            disabled={
              loading ||
              !validateAccountNumber(formData.accountNumber) ||
              !validateAccountHolder(formData.accountHolder)
            }
          >
            {loading ? "Đang cập nhật..." : "Cập nhật thông tin"}
          </button>
        </div>
      </form>

      {currentBankInfo && !currentBankInfo.isVerified && (
        <div className="verification-notice">
          <h4>🔍 Quá trình xác minh</h4>
          <p>Thông tin ngân hàng của bạn đang chờ admin xác minh.</p>
          <p>Quá trình này thường mất 24-48 giờ làm việc.</p>
          <p>Bạn sẽ nhận được thông báo khi xác minh hoàn tất.</p>
        </div>
      )}
    </div>
  );
};

export default BankInfoForm;
