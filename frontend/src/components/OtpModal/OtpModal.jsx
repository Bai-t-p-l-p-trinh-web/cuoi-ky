import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import apiClient from "../../utils/axiosConfig";
import "./OtpModal.scss";

const OtpModal = ({
  isOpen,
  onClose,
  email,
  title = "Xác thực OTP",
  description = "Vui lòng nhập mã OTP để xác thực.",
  onSuccess,
  actionRequired, // VERIFY_REGISTER, VERIFY_ACCOUNT, VERIFY_2FA_LOGIN, VERIFY_NEW_EMAIL
  customApiPayload = null,
}) => {
  const [otpValue, setOtpValue] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(180); // 3 minutes in seconds
  const [isCountdownActive, setIsCountdownActive] = useState(true);
  const [endTime, setEndTime] = useState(null);

  // Countdown timer effect using timestamp to avoid tab switching issues
  useEffect(() => {
    let timer;
    if (isOpen && isCountdownActive && endTime) {
      timer = setInterval(() => {
        const now = Date.now();
        const remaining = endTime - now;

        if (remaining <= 0) {
          setCountdown(0);
          setIsCountdownActive(false);
          toast.info("Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.");
          clearInterval(timer);
        } else {
          const totalSeconds = Math.floor(remaining / 1000);
          setCountdown(totalSeconds);
        }
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, isCountdownActive, endTime]);

  // Reset countdown when modal opens
  useEffect(() => {
    if (isOpen) {
      const countDownDuration = 3 * 60 * 1000; // 3 phút
      const startTime = Date.now();
      const newEndTime = startTime + countDownDuration;

      setEndTime(newEndTime);
      setCountdown(180);
      setIsCountdownActive(true);
    }
  }, [isOpen]);

  // Format countdown time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };
  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (!otpValue.trim()) {
      toast.error("Vui lòng nhập mã OTP");
      return;
    }

    // Map action required to API endpoints and OTP types
    const getApiConfig = (actionRequired) => {
      switch (actionRequired) {
        case "VERIFY_REGISTER":
          return {
            endpoint: "/api/v1/auth/verify-otp",
            type: "VERIFY_REGISTER",
          };
        case "VERIFY_FIRST_TIME":
          return {
            endpoint: "/api/v1/auth/verify-otp",
            type: "VERIFY_FIRST_TIME",
          };
        case "VERIFY_2FA_LOGIN":
          return {
            endpoint: "/api/v1/auth/verify-login-otp",
            type: "VERIFY_2FA_LOGIN",
            customPayload: true,
          };
        case "VERIFY_NEW_EMAIL":
          return {
            endpoint: "/api/v1/auth/verify-otp",
            type: "VERIFY_NEW_EMAIL",
          };
        case "REQUEST_OTP_AGAIN":
          return {
            endpoint: "/api/v1/auth/verify-otp",
            type: "REQUEST_OTP_AGAIN",
          };
        case "VERIFY_RESET_PASSWORD":
          return {
            endpoint: "/api/v1/auth/verify-otp",
            type: "VERIFY_RESET_PASSWORD",
          };
        case "VERIFY_ACCOUNT":
          return {
            endpoint: "/api/v1/auth/verify-otp",
            type: "VERIFY_ACCOUNT",
          };
      }
    };

    setIsVerifyingOtp(true);
    try {
      const config = getApiConfig(actionRequired);
      let payload;

      if (config.customPayload || customApiPayload) {
        // For login OTP verification
        payload = {
          email,
          otp: otpValue.trim(),
          ...(customApiPayload || {}),
        };
      } else {
        // For standard OTP verification
        payload = {
          email,
          otp: otpValue.trim(),
          type: config.type,
        };
      }

      const response = await apiClient.post(config.endpoint, payload);
      const responseData = response.data;

      if (responseData.success) {
        toast.success(responseData.message || "Xác thực thành công!");
        setOtpValue("");
        onSuccess(responseData);
        onClose();
      } else {
        toast.error(responseData.message || "Mã OTP không hợp lệ");
        setOtpValue("");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      if (error.response?.data) {
        toast.error(error.response.data.message || "Mã OTP không hợp lệ");
      } else {
        toast.error("Đã xảy ra lỗi kết nối. Vui lòng thử lại.");
      }
      setOtpValue("");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResendingOtp(true);
    try {
      const payload = {
        email,
        type: "REQUEST_OTP_AGAIN",
      };

      const response = await apiClient.post("/api/v1/auth/send-otp", payload);
      const responseData = response.data;

      if (responseData.success) {
        toast.success("Mã OTP mới đã được gửi đến email của bạn");
        // Reset countdown when new OTP is sent
        const countDownDuration = 3 * 60 * 1000;
        const startTime = Date.now();
        const newEndTime = startTime + countDownDuration;

        setEndTime(newEndTime);
        setCountdown(180);
        setIsCountdownActive(true);
      } else {
        toast.error(responseData.message || "Không thể gửi lại mã OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error("Đã xảy ra lỗi khi gửi lại mã OTP");
    } finally {
      setIsResendingOtp(false);
    }
  };
  const handleClose = () => {
    setOtpValue("");
    setCountdown(180);
    setIsCountdownActive(false);
    setEndTime(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="otp-modal-overlay">
      <div className="otp-modal">
        <div className="otp-modal__header">
          <h3>{title}</h3>
          <button
            type="button"
            className="otp-modal__close"
            onClick={handleClose}
            disabled={isVerifyingOtp}
          >
            ×
          </button>
        </div>
        <div className="otp-modal__body">
          <p>
            Chúng tôi đã gửi mã OTP đến địa chỉ email: <strong>{email}</strong>
          </p>
          <p>{description}</p>
          <div className="otp-modal__countdown">
            <p
              className={`countdown-timer ${
                countdown <= 30 ? "countdown-warning" : ""
              }`}
            >
              Mã OTP sẽ hết hạn sau: <strong>{formatTime(countdown)}</strong>
            </p>
          </div>
          <form onSubmit={handleOtpSubmit}>
            <input
              type="text"
              className="otp-modal__input"
              placeholder="Nhập mã OTP"
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value)}
              disabled={isVerifyingOtp || countdown === 0}
              maxLength={6}
            />
            <div className="otp-modal__actions">
              <button
                type="submit"
                className="otp-modal__submit"
                disabled={isVerifyingOtp || !otpValue.trim() || countdown === 0}
              >
                {isVerifyingOtp ? "Đang xác thực..." : "Xác thực"}
              </button>
              <button
                type="button"
                className="otp-modal__resend"
                onClick={handleResendOtp}
                disabled={isVerifyingOtp}
              >
                {isResendingOtp ? "Đang gửi lại mã OTP..." : "Gửi lại mã OTP"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OtpModal;
