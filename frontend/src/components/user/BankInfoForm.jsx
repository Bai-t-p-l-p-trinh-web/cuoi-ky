import React, { useState, useEffect } from "react";
import { userBankAPI } from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import "./BankInfoForm.scss";

const BankInfoForm = ({ initialData, onSave, onCancel }) => {
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

    // Nếu có initialData từ props, sử dụng nó
    if (initialData) {
      setFormData({
        bankName: initialData.bankName || "",
        bankCode: initialData.bankCode || "",
        accountNumber: initialData.accountNumber || "",
        accountHolder: initialData.accountHolder || "",
      });
      setCurrentBankInfo(initialData);
    }
  }, [initialData]);

  const fetchCurrentBankInfo = async () => {
    try {
      const response = await userBankAPI.get();
      console.log(response);
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
      // Nếu có onSave (từ BankInfoManagement), sử dụng nó thay vì gọi API trực tiếp
      if (onSave) {
        await onSave(formData);
        // onSave sẽ handle việc cập nhật và đóng form
      } else {
        // Fallback: gọi API trực tiếp nếu không có onSave
        const response = await userBankAPI.update(formData);
        toast.success("Cập nhật thông tin ngân hàng thành công!");

        // Đóng form
        if (onCancel) {
          onCancel();
        }
      }
    } catch (error) {
      console.error("Error updating bank info:", error);
      toast.error(
        error.response?.data?.message ||
          "Không thể cập nhật thông tin ngân hàng"
      );
    } finally {
      setLoading(false);
    }
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
    <div className="bank-info-form-container">
      <div className="bank-info-form">
        <div className="form-header">
          <div className="header-content">
            <div className="header-icon">
              <i className="fas fa-university"></i>
            </div>
            <div className="header-text">
              <h3>
                {currentBankInfo
                  ? "Cập nhật thông tin ngân hàng"
                  : "Thêm thông tin ngân hàng"}
              </h3>
              <p>Thông tin bảo mật, chỉ dùng cho thanh toán</p>
            </div>
          </div>{" "}
          {onCancel && (
            <button className="close-btn" onClick={onCancel}>
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
        {currentBankInfo && (
          <div className="current-info-card">
            <div className="card-header">
              <h4>
                <i className="fas fa-info-circle"></i>
                Thông tin hiện tại
              </h4>
              <span
                className={`status-badge ${
                  currentBankInfo.isVerified ? "verified" : "pending"
                }`}
              >
                {currentBankInfo.isVerified ? (
                  <>
                    <i className="fas fa-check-circle"></i>
                    Đã xác minh
                  </>
                ) : (
                  <>
                    <i className="fas fa-clock"></i>
                    Chờ xác minh
                  </>
                )}
              </span>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">
                  <i className="fas fa-building"></i>
                  Ngân hàng
                </div>
                <div className="info-value">{currentBankInfo.bankName}</div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <i className="fas fa-credit-card"></i>
                  Số tài khoản
                </div>
                <div className="info-value">
                  {currentBankInfo.accountNumber}
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <i className="fas fa-user"></i>
                  Chủ tài khoản
                </div>
                <div className="info-value">
                  {currentBankInfo.accountHolder}
                </div>
              </div>
              {currentBankInfo.verifiedAt && (
                <div className="info-item">
                  <div className="info-label">
                    <i className="fas fa-calendar-check"></i>
                    Xác minh lúc
                  </div>
                  <div className="info-value">
                    {new Date(currentBankInfo.verifiedAt).toLocaleString(
                      "vi-VN"
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}{" "}
        <form onSubmit={handleSubmit} className="form-content">
          <div className="form-group">
            <label>
              <i className="fas fa-university"></i>
              Ngân hàng <span className="required">*</span>
            </label>
            <div className="select-wrapper">
              <select
                value={formData.bankCode}
                onChange={(e) => handleBankChange(e.target.value)}
                required
                className="styled-select"
              >
                <option value="">-- Chọn ngân hàng --</option>
                {bankOptions.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
              <i className="fas fa-chevron-down select-arrow"></i>
            </div>
          </div>
          <div className="form-group">
            <label>
              <i className="fas fa-credit-card"></i>
              Số tài khoản <span className="required">*</span>
            </label>
            <div className="input-wrapper">
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
                className={
                  formData.accountNumber &&
                  !validateAccountNumber(formData.accountNumber)
                    ? "error"
                    : ""
                }
              />
              <i className="fas fa-hashtag input-icon"></i>
            </div>
            {formData.accountNumber &&
              !validateAccountNumber(formData.accountNumber) && (
                <small className="error-text">
                  <i className="fas fa-exclamation-triangle"></i>
                  Số tài khoản phải từ 6-20 chữ số
                </small>
              )}
          </div>
          <div className="form-group">
            <label>
              <i className="fas fa-user"></i>
              Chủ tài khoản <span className="required">*</span>
            </label>
            <div className="input-wrapper">
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
                className={
                  formData.accountHolder &&
                  !validateAccountHolder(formData.accountHolder)
                    ? "error"
                    : ""
                }
              />
              <i className="fas fa-user-tag input-icon"></i>
            </div>
            {formData.accountHolder &&
              !validateAccountHolder(formData.accountHolder) && (
                <small className="error-text">
                  <i className="fas fa-exclamation-triangle"></i>
                  Tên chủ TK phải viết hoa, chỉ gồm chữ cái và khoảng trắng
                </small>
              )}
          </div>
          <div className="important-notice">
            <div className="notice-header">
              <i className="fas fa-info-circle"></i>
              <h4>Lưu ý quan trọng</h4>
            </div>
            <ul className="notice-list">
              <li>
                <i className="fas fa-check-circle"></i>
                Thông tin ngân hàng phải chính xác 100%
              </li>
              <li>
                <i className="fas fa-check-circle"></i>
                Tên chủ tài khoản phải viết HOA và đúng như trên thẻ ngân hàng
              </li>
              <li>
                <i className="fas fa-check-circle"></i>
                Admin sẽ xác minh thông tin trong vòng 24h
              </li>
              <li>
                <i className="fas fa-check-circle"></i>
                Thông tin đã xác minh mới được sử dụng cho giao dịch
              </li>
              <li>
                <i className="fas fa-check-circle"></i>
                Chỉ tài khoản của chính bạn mới được chấp nhận
              </li>
            </ul>
          </div>{" "}
          <div className="form-actions">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="btn-secondary"
              >
                <i className="fas fa-times"></i>
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
              className="btn-primary"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  Cập nhật thông tin
                </>
              )}
            </button>
          </div>
        </form>
        {currentBankInfo && !currentBankInfo.isVerified && (
          <div className="verification-notice">
            <div className="notice-icon">
              <i className="fas fa-search"></i>
            </div>
            <div className="notice-content">
              <h4>Quá trình xác minh</h4>
              <p>Thông tin ngân hàng của bạn đang chờ admin xác minh.</p>
              <p>Quá trình này thường mất 24-48 giờ làm việc.</p>
              <p>Bạn sẽ nhận được thông báo khi xác minh hoàn tất.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankInfoForm;
