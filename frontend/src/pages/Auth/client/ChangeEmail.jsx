import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { logout } from "../../../features/auth/authSlice";
import apiClient from "../../../utils/axiosConfig";
import OtpModal from "../../../components/OtpModal/OtpModal";
import "./scss/ChangeEmail.scss";

function ChangeEmail() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [step, setStep] = useState(1); // 1: verify current email, 2: enter new email
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(true); // Show OTP modal immediately
  const [action, setAction] = useState("VERIFY_CURRENT_EMAIL");
  const [newEmail, setNewEmail] = useState("");
  const [isCurrentEmailVerified, setIsCurrentEmailVerified] = useState(false); // Track if current email is verified

  // Send OTP to current email when component mounts
  useEffect(() => {
    const sendCurrentEmailOTP = async () => {
      try {
        const response = await apiClient.post("/auth/send-otp", {
          email: user?.email,
          type: "VERIFY_CURRENT_EMAIL",
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

  const handleSubmitNewEmail = async (e) => {
    e.preventDefault();

    if (!newEmail.trim()) {
      toast.error("Vui lòng nhập email mới");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error("Định dạng email không hợp lệ");
      return;
    }

    if (newEmail.trim() === user?.email) {
      toast.error("Email mới phải khác email hiện tại");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post("/auth/change-email", {
        oldEmail: user?.email,
        newEmail: newEmail.trim(),
      });

      if (response.data.success) {
        toast.success("OTP đã được gửi đến email mới của bạn");
        setAction("VERIFY_NEW_EMAIL");
        setShowOtpModal(true);
      } else {
        toast.error(response.data.message || "Gửi OTP thất bại");
      }
    } catch (error) {
      console.error("Send new email OTP error:", error);
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi gửi OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP success
  const handleOtpSuccess = (responseData) => {
    if (action === "VERIFY_CURRENT_EMAIL") {
      toast.success("Xác thực email hiện tại thành công!");
      setIsCurrentEmailVerified(true);
      setStep(2);
      setShowOtpModal(false);
    } else if (action === "VERIFY_NEW_EMAIL") {
      toast.success("Đổi email thành công! Đang đăng xuất...");
      setShowOtpModal(false);

      // Logout and redirect to login
      setTimeout(() => {
        dispatch(logout());
        navigate("/login");
      }, 2000);
    }
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
    if (action === "VERIFY_CURRENT_EMAIL" && !isCurrentEmailVerified) {
      setStep(2);
    }
  };

  // Function to retry current email verification
  const retryCurrentEmailVerification = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.post("/auth/send-otp", {
        email: user?.email,
        type: "VERIFY_CURRENT_EMAIL",
      });
      if (response.data.success) {
        toast.success("OTP đã được gửi lại đến email hiện tại của bạn");
        setAction("VERIFY_CURRENT_EMAIL");
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

  const handleBackToAccount = () => {
    navigate("/my_account");
  };

  return (
    <>
      <div className="changeEmail">
        <ToastContainer />
        <div className="changeEmail__container">
          {" "}
          <div className="changeEmail__header">
            <button
              onClick={handleBackToAccount}
              className="changeEmail__back-btn"
            >
              Quay lại tài khoản
            </button>
            <h2>Đổi Email</h2>{" "}
          </div>
          {step === 1 && (
            <div className="changeEmail__step">
              <div className="changeEmail__info">
                <h3>Đang xác thực email hiện tại</h3>
                <p>
                  Để đảm bảo bảo mật, chúng tôi đã gửi mã OTP đến email hiện tại
                  của bạn. Vui lòng kiểm tra email và nhập mã OTP để tiếp tục.
                </p>
                <p className="changeEmail__current-email">
                  <strong>Email hiện tại:</strong> {user?.email}
                </p>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="changeEmail__step">
              {isCurrentEmailVerified ? (
                <>
                  <div className="changeEmail__info">
                    <h3>Nhập email mới</h3>
                    <p>
                      Nhập địa chỉ email mới của bạn. Chúng tôi sẽ gửi mã OTP để
                      xác thực email mới.
                    </p>
                    <p className="changeEmail__current-email">
                      <strong>Email hiện tại:</strong> {user?.email}
                    </p>
                  </div>

                  <form
                    onSubmit={handleSubmitNewEmail}
                    className="changeEmail__form"
                  >
                    <div className="changeEmail__form-group">
                      <label htmlFor="newEmail">Email mới</label>
                      <input
                        type="email"
                        id="newEmail"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Nhập email mới"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="changeEmail__btn changeEmail__btn--primary"
                    >
                      {isLoading ? "Đang gửi..." : "Gửi OTP xác thực"}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div className="changeEmail__info changeEmail__info--warning">
                    <h3>⚠️ Cần xác thực email hiện tại</h3>
                    <p>
                      Bạn cần xác thực email hiện tại trước khi có thể thay đổi
                      sang email mới.
                    </p>
                    <p className="changeEmail__current-email">
                      <strong>Email hiện tại:</strong> {user?.email}
                    </p>
                  </div>

                  <button
                    onClick={retryCurrentEmailVerification}
                    disabled={isLoading}
                    className="changeEmail__btn changeEmail__btn--secondary"
                  >
                    {isLoading ? "Đang gửi..." : "Gửi lại mã OTP xác thực"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>{" "}
        {showOtpModal && (
          <OtpModal
            isOpen={showOtpModal}
            onClose={closeOtpModal}
            onSuccess={handleOtpSuccess}
            actionRequired={action}
            title={
              action === "VERIFY_CURRENT_EMAIL"
                ? "Xác thực email hiện tại"
                : "Xác thực email mới"
            }
            description={
              action === "VERIFY_CURRENT_EMAIL"
                ? "Nhập mã OTP đã được gửi đến email hiện tại của bạn"
                : "Nhập mã OTP đã được gửi đến email mới của bạn"
            }
            email={user?.email}
            customApiPayload={
              action === "VERIFY_NEW_EMAIL"
                ? { oldEmail: user?.email, newEmail: newEmail }
                : null
            }
          />
        )}
      </div>
    </>
  );
}

export default ChangeEmail;
