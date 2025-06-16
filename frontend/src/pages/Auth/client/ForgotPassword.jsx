import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./scss/ForgotPassword.scss";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import apiClient from "../../../utils/axiosConfig";
import OtpModal from "../../../components/OtpModal";

function ForgotPassword() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return passwordRegex.test(password);
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }

    if (!validateEmail(email.trim())) {
      toast.error("Định dạng email không hợp lệ");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post("/auth/send-otp", {
        email: email.trim(),
        type: "VERIFY_RESET_PASSWORD",
      });

      const responseData = response.data;
      if (responseData.success) {
        toast.success("Mã OTP đã được gửi đến email của bạn");
        setShowOtpModal(true);
      } else {
        toast.error(responseData.message);
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      if (error.response?.data) {
        const errorData = error.response.data;
        toast.error(errorData.message || "Đã xảy ra lỗi khi gửi OTP");
      } else {
        toast.error("Đã xảy ra lỗi kết nối. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSuccess = (responseData) => {
    setUserId(responseData.data.userId);
    setShowOtpModal(false);
    setShowResetForm(true);
    toast.success("Xác thực thành công! Vui lòng nhập mật khẩu mới.");
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (!validatePassword(newPassword)) {
      toast.error(
        "Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa và 1 ký tự đặc biệt"
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post("/auth/reset-password", {
        userId: userId,
        newPassword: newPassword.trim(),
      });

      const responseData = response.data;
      if (responseData.success) {
        toast.success(responseData.message);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error(responseData.message);
      }
    } catch (error) {
      console.error("Reset password error:", error);
      if (error.response?.data) {
        const errorData = error.response.data;
        toast.error(errorData.message || "Đã xảy ra lỗi khi đặt lại mật khẩu");
      } else {
        toast.error("Đã xảy ra lỗi kết nối. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
  };

  if (!showResetForm) {
    return (
      <>
        <div className="forgotPassword">
          <ToastContainer />
          <div className="forgotPassword__contain">
            <h3 className="forgotPassword__title">Quên mật khẩu</h3>
            <p className="forgotPassword__description">
              Nhập email của bạn để nhận mã xác thực và đặt lại mật khẩu
            </p>
            <p className="forgotPassword__back">
              Nhớ mật khẩu? <Link to="/login">Đăng nhập</Link>
            </p>
            <form className="forgotPassword__form" onSubmit={handleSendOtp}>
              <label
                className="forgotPassword__form__email-label"
                htmlFor="forgotPasswordEmail"
              >
                Email
              </label>
              <input
                className="forgotPassword__form__email-input"
                type="email"
                id="forgotPasswordEmail"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập địa chỉ email của bạn"
                disabled={isLoading}
              />
              <button
                className="forgotPassword__form__submit"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Đang gửi..." : "Gửi mã xác thực"}
              </button>
            </form>
          </div>

          {/* OTP Modal */}
          <OtpModal
            isOpen={showOtpModal}
            onClose={closeOtpModal}
            email={email}
            title="Xác thực đặt lại mật khẩu"
            description="Vui lòng nhập mã OTP được gửi đến email của bạn để tiếp tục đặt lại mật khẩu."
            onSuccess={handleOtpSuccess}
            actionRequired="VERIFY_ACCOUNT"
          />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="forgotPassword">
        <ToastContainer />
        <div className="forgotPassword__contain">
          <h3 className="forgotPassword__title">Đặt lại mật khẩu</h3>
          <p className="forgotPassword__description">
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn
          </p>
          <form className="forgotPassword__form" onSubmit={handleResetPassword}>
            <label
              className="forgotPassword__form__password-label"
              htmlFor="newPassword"
            >
              Mật khẩu mới
            </label>
            <div className="forgotPassword__form__password-contain">
              <input
                className="forgotPassword__form__password-input"
                type={showPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                disabled={isLoading}
              />
              <button
                type="button"
                className="forgotPassword__form__password-toggle"
                onClick={toggleShowPassword}
                disabled={isLoading}
              >
                {showPassword ? (
                  <FaEyeSlash className="forgotPassword__form__password-icon" />
                ) : (
                  <FaEye className="forgotPassword__form__password-icon" />
                )}
              </button>
            </div>
            <label
              className="forgotPassword__form__password-label"
              htmlFor="confirmPassword"
            >
              Xác nhận mật khẩu
            </label>
            <div className="forgotPassword__form__password-contain">
              <input
                className="forgotPassword__form__password-input"
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                disabled={isLoading}
              />
              <button
                type="button"
                className="forgotPassword__form__password-toggle"
                onClick={toggleShowPassword}
                disabled={isLoading}
              >
                {showPassword ? (
                  <FaEyeSlash className="forgotPassword__form__password-icon" />
                ) : (
                  <FaEye className="forgotPassword__form__password-icon" />
                )}
              </button>
            </div>
            <button
              className="forgotPassword__form__submit"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;
