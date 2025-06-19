import React, { useState } from "react";
import { refundAPI } from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import "./RefundRequestForm.scss";

const RefundRequestForm = ({ order, onRefundCreated, onClose }) => {
  const [formData, setFormData] = useState({
    reason: "",
    description: "",
    evidence: [""],
    bankInfo: {
      bankName: "",
      bankCode: "",
      accountNumber: "",
      accountHolder: "",
    },
  });
  const [loading, setLoading] = useState(false);

  const reasonOptions = [
    { value: "buyer_changed_mind", label: "Tôi đổi ý không muốn mua nữa" },
    { value: "car_not_as_described", label: "Xe không đúng như mô tả" },
    { value: "seller_fraud", label: "Người bán lừa đảo" },
    { value: "delivery_failed", label: "Giao hàng thất bại" },
    { value: "other", label: "Lý do khác" },
  ];

  const bankOptions = [
    { code: "970422", name: "MB Bank" },
    { code: "970407", name: "Techcombank" },
    { code: "970415", name: "Vietinbank" },
    { code: "970436", name: "Vietcombank" },
    { code: "970405", name: "Agribank" },
    { code: "970418", name: "BIDV" },
    { code: "970432", name: "VPBank" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty evidence
      const cleanEvidence = formData.evidence.filter((url) => url.trim());

      const response = await refundAPI.create({
        orderId: order._id,
        reason: formData.reason,
        description: formData.description,
        evidence: cleanEvidence,
        bankInfo: formData.bankInfo,
      });

      toast.success("Yêu cầu hoàn tiền đã được tạo thành công!");
      onRefundCreated(response.data.refund);
    } catch (error) {
      console.error("Error creating refund:", error);
    }

    setLoading(false);
  };

  const addEvidenceField = () => {
    setFormData({
      ...formData,
      evidence: [...formData.evidence, ""],
    });
  };

  const removeEvidenceField = (index) => {
    const newEvidence = formData.evidence.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      evidence: newEvidence,
    });
  };

  const updateEvidence = (index, value) => {
    const newEvidence = [...formData.evidence];
    newEvidence[index] = value;
    setFormData({
      ...formData,
      evidence: newEvidence,
    });
  };

  const handleBankChange = (bankCode) => {
    const selectedBank = bankOptions.find((bank) => bank.code === bankCode);
    setFormData({
      ...formData,
      bankInfo: {
        ...formData.bankInfo,
        bankCode,
        bankName: selectedBank ? selectedBank.name : "",
      },
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getRefundAmount = () => {
    // Calculate refund amount based on order status and payments
    if (order.status === "paid_partial") {
      return order.depositAmount || 0;
    } else if (order.status === "paid_full") {
      return order.totalAmount || 0;
    }
    return order.paidAmount || 0;
  };

  return (
    <div className="refund-request-form">
      <div className="form-header">
        <h3>Yêu cầu hoàn tiền</h3>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="order-info">
        <h4>Thông tin đơn hàng</h4>
        <div className="order-details">
          <div className="detail-row">
            <span>Mã đơn hàng:</span>
            <span>{order.orderCode}</span>
          </div>
          <div className="detail-row">
            <span>Xe:</span>
            <span>{order.car?.title}</span>
          </div>
          <div className="detail-row">
            <span>Số tiền có thể hoàn:</span>
            <span className="refund-amount">
              {formatPrice(getRefundAmount())}
            </span>
          </div>
          <div className="detail-row">
            <span>Trạng thái:</span>
            <span className={`status ${order.status}`}>{order.status}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h4>Lý do hoàn tiền</h4>

          <div className="form-group">
            <label>Chọn lý do:</label>
            <select
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              required
            >
              <option value="">-- Chọn lý do --</option>
              {reasonOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Mô tả chi tiết:</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows="4"
              placeholder="Vui lòng mô tả chi tiết lý do hoàn tiền..."
              required
            />
            <small>Tối thiểu 10 ký tự, tối đa 1000 ký tự</small>
          </div>

          <div className="form-group">
            <label>Bằng chứng (tùy chọn):</label>
            {formData.evidence.map((evidence, index) => (
              <div key={index} className="evidence-field">
                <input
                  type="url"
                  value={evidence}
                  onChange={(e) => updateEvidence(index, e.target.value)}
                  placeholder="Link ảnh/video chứng minh (VD: imgur.com/abc123)"
                />
                {formData.evidence.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEvidenceField(index)}
                    className="remove-evidence"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addEvidenceField}
              className="add-evidence"
            >
              + Thêm bằng chứng
            </button>
          </div>
        </div>

        <div className="form-section">
          <h4>Thông tin nhận tiền hoàn</h4>

          <div className="form-group">
            <label>Ngân hàng:</label>
            <select
              value={formData.bankInfo.bankCode}
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
            <label>Số tài khoản:</label>
            <input
              type="text"
              value={formData.bankInfo.accountNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bankInfo: {
                    ...formData.bankInfo,
                    accountNumber: e.target.value,
                  },
                })
              }
              placeholder="Nhập số tài khoản"
              required
            />
          </div>

          <div className="form-group">
            <label>Chủ tài khoản:</label>
            <input
              type="text"
              value={formData.bankInfo.accountHolder}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bankInfo: {
                    ...formData.bankInfo,
                    accountHolder: e.target.value,
                  },
                })
              }
              placeholder="NGUYEN VAN A (viết hoa, đúng như trên thẻ)"
              required
            />
          </div>
        </div>

        <div className="warning-section">
          <h4>⚠️ Lưu ý quan trọng</h4>
          <ul>
            <li>
              Yêu cầu hoàn tiền sẽ được admin xem xét trong vòng 24-48 giờ
            </li>
            <li>Vui lòng cung cấp thông tin ngân hàng chính xác</li>
            <li>Bằng chứng càng đầy đủ, quá trình xử lý càng nhanh</li>
            <li>
              Một số trường hợp có thể bị từ chối hoàn tiền theo chính sách
            </li>
          </ul>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} disabled={loading}>
            Hủy
          </button>
          <button type="submit" disabled={loading}>
            {loading ? "Đang gửi yêu cầu..." : "Gửi yêu cầu hoàn tiền"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RefundRequestForm;
