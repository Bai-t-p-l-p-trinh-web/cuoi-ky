import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { logout } from "../../../features/auth/authSlice";
import apiClient from "../../../utils/axiosConfig";
import OtpModal from "../../../components/OtpModal/OtpModal";
import "./scss/ChangePassword.scss";

function ChangePassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [step, setStep] = useState(1); // 1: verify current email, 2: change password form
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(true); // Show OTP modal immediately
  const [action, setAction] = useState("VERIFY_CHANGE_PASSWORD");
  const [isCurrentEmailVerified, setIsCurrentEmailVerified] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Send OTP to current email when component mounts
  useEffect(() => {
    const sendCurrentEmailOTP = async () => {
      try {
        const response = await apiClient.post("/auth/send-otp", {
          email: user?.email,
          type: "VERIFY_CHANGE_PASSWORD",
        });
        if (response.data.success) {
          toast.success("OTP đã được gửi đến email hiện tại của bạn");
        }
      } catch (error) {
        console.error("Send current email OTP error:", error);
        toast.error("Không thể gửi OTP đến email hiện tại");
        setShowOtpModal(false);
      }
    };

    if (user?.email) {
      sendCurrentEmailOTP();
    }
  }, [user?.email]);

  // Handle OTP success
  const handleOtpSuccess = (responseData) => {
    toast.success("Xác thực OTP thành công!");
    setIsCurrentEmailVerified(true);
    setStep(2);
    setShowOtpModal(false);
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
    // If user closes modal during verification but not verified yet,
    // move to step 2 to show warning message
    if (!isCurrentEmailVerified) {
      setStep(2);
    }
  };

  // Function to retry current email verification
  const retryCurrentEmailVerification = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.post("/auth/send-otp", {
        email: user?.email,
        type: "VERIFY_CHANGE_PASSWORD",
      });
      if (response.data.success) {
        toast.success("OTP đã được gửi lại đến email hiện tại của bạn");
        setAction("VERIFY_CHANGE_PASSWORD");
        setShowOtpModal(true);
      } else {
        toast.error("Không thể gửi OTP. Vui lòng thử lại");
      }
    } catch (error) {
      console.error("Retry send OTP error:", error);
      toast.error("Đã xảy ra lỗi khi gửi OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit change password
  const handleSubmitChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword.trim()) {
      toast.error("Vui lòng nhập mật khẩu hiện tại");
      return;
    }

    if (!newPassword.trim()) {
      toast.error("Vui lòng nhập mật khẩu mới");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (newPassword === currentPassword) {
      toast.error("Mật khẩu mới phải khác mật khẩu hiện tại");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post("/auth/change-password", {
        userId: user?.id,
        oldPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });

      if (response.data.success) {
        toast.success("Đổi mật khẩu thành công! Đang đăng xuất...");

        // Logout and redirect to login after 2 seconds
        setTimeout(() => {
          dispatch(logout());
          navigate("/login");
        }, 2000);
      } else {
        toast.error(response.data.message || "Đổi mật khẩu thất bại");
      }
    } catch (error) {
      console.error("Change password error:", error);
      toast.error(
        error.response?.data?.message || "Đã xảy ra lỗi khi đổi mật khẩu"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToAccount = () => {
    navigate("/my_account");
  };

  return (
    <>
      <div className="changePassword">
        <ToastContainer />
        <div className="changePassword__container">
          <div className="changePassword__header">
            <button
              onClick={handleBackToAccount}
              className="changePassword__back-btn"
            >
              Quay lại tài khoản
            </button>
            <h2>Đổi Mật Khẩu</h2>
          </div>

          {step === 1 && (
            <div className="changePassword__step">
              <div className="changePassword__info">
                <h3>Đang xác thực email hiện tại</h3>
                <p>
                  Để đảm bảo bảo mật, chúng tôi đã gửi mã OTP đến email hiện tại
                  của bạn. Vui lòng kiểm tra email và nhập mã OTP để tiếp tục.
                </p>
                <p className="changePassword__current-email">
                  <strong>Email hiện tại:</strong> {user?.email}
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="changePassword__step">
              {isCurrentEmailVerified ? (
                // Show change password form if current email is verified
                <>
                  <div className="changePassword__info">
                    <h3>Đổi mật khẩu</h3>
                    <p>
                      Nhập mật khẩu hiện tại và mật khẩu mới. Mật khẩu phải có
                      ít nhất 8 ký tự, 1 chữ hoa và 1 ký tự đặc biệt.
                    </p>
                  </div>

                  <form
                    onSubmit={handleSubmitChangePassword}
                    className="changePassword__form"
                  >
                    <div className="changePassword__form-group">
                      <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
                      <input
                        type="password"
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Nhập mật khẩu hiện tại"
                        required
                      />
                    </div>

                    <div className="changePassword__form-group">
                      <label htmlFor="newPassword">Mật khẩu mới</label>
                      <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nhập mật khẩu mới"
                        required
                      />
                    </div>

                    <div className="changePassword__form-group">
                      <label htmlFor="confirmPassword">
                        Xác nhận mật khẩu mới
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="changePassword__btn changePassword__btn--primary"
                    >
                      {isLoading ? "Đang cập nhật..." : "Đổi mật khẩu"}
                    </button>
                  </form>
                </>
              ) : (
                // Show retry verification if current email is not verified yet
                <>
                  <div className="changePassword__info changePassword__info--warning">
                    <h3>⚠️ Cần xác thực email hiện tại</h3>
                    <p>
                      Bạn cần xác thực email hiện tại trước khi có thể thay đổi
                      mật khẩu.
                    </p>
                    <p className="changePassword__current-email">
                      <strong>Email hiện tại:</strong> {user?.email}
                    </p>
                  </div>

                  <button
                    onClick={retryCurrentEmailVerification}
                    disabled={isLoading}
                    className="changePassword__btn changePassword__btn--secondary"
                  >
                    {isLoading ? "Đang gửi..." : "Gửi lại mã OTP xác thực"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {showOtpModal && (
          <OtpModal
            isOpen={showOtpModal}
            onClose={closeOtpModal}
            onSuccess={handleOtpSuccess}
            email={user?.email}
            actionRequired={action}
            title="Xác thực thay đổi mật khẩu"
            description="Nhập mã OTP đã được gửi đến email hiện tại của bạn để tiếp tục đổi mật khẩu"
          />
        )}
      </div>
    </>
  );
}

export default ChangePassword;
