import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import "./scss/ClientLogin.scss";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { setUser } from "../../../features/auth/authSlice";
import apiClient from "../../../utils/axiosConfig";
import OtpModal from "../../../components/OtpModal";

function ClientAuth() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpActionRequired, setOtpActionRequired] = useState("");
  const [dataClientLogin, setDataClientLogin] = useState({
    email: "",
    password: "",
  });

  // Xử lý OAuth error messages
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      const errorMessages = {
        oauth_cancelled: "Đăng nhập Google đã bị hủy",
        email_not_verified: "Email Google chưa được xác thực",
        user_creation_failed: "Không thể tạo tài khoản mới",
        oauth_failed: "Đã xảy ra lỗi trong quá trình đăng nhập Google",
      };

      toast.error(errorMessages[error] || "Đã xảy ra lỗi không xác định");

      // Clear error from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams]);

  const handleChangeValue = (e) => {
    const { name, value } = e.target;

    setDataClientLogin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const ToggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const validateForm = () => {
    const { email, password } = dataClientLogin;

    if (!email.trim() || !password.trim()) {
      toast.error("Email và mật khẩu không được bỏ trống");
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Định dạng email không hợp lệ");
      return false;
    }

    return true;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post("/auth/login", {
        email: dataClientLogin.email.trim(),
        password: dataClientLogin.password.trim(),
      });

      const responseData = response.data;
      if (responseData.success) {
        if (responseData.data?.user) {
          // Lưu user info vào localStorage và Redux
          localStorage.setItem("user", JSON.stringify(responseData.data.user));
          dispatch(setUser(responseData.data.user));
          toast.success(responseData.message || "Đăng nhập thành công!");
          setTimeout(() => {
            // Redirect based on user role
            if (responseData.data.user.role === "admin") {
              navigate("/admin/dashboard");
            } else {
              navigate("/");
            }
          }, 1500);
        } else {
          if (responseData.data?.actionRequired === "VERIFY_2FA_LOGIN") {
            setOtpActionRequired(responseData.data.actionRequired);
            setShowOtpModal(true);
          }
        }
      } else {
        if (responseData.data?.actionRequired === "VERIFY_FIRST_TIME") {
          toast.info(responseData.message);
          setOtpActionRequired(responseData.data.actionRequired);
          setShowOtpModal(true);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.data) {
        const errorData = error.response.data;
        toast.error(errorData.message || "Đã xảy ra lỗi khi đăng nhập");
        if (errorData.data?.actionRequired === "VERIFY_REGISTER") {
          setOtpActionRequired(errorData.data.actionRequired);
          setShowOtpModal(true);
        }
      } else {
        toast.error("Đã xảy ra lỗi kết nối. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleOtpSuccess = (responseData) => {
    if (responseData.data?.user) {
      // Lưu user info vào localStorage và Redux
      localStorage.setItem("user", JSON.stringify(responseData.data.user));
      dispatch(setUser(responseData.data.user));
      setTimeout(() => {
        // Redirect based on user role
        if (responseData.data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      }, 1500);
    }
  };
  const closeOtpModal = () => {
    setShowOtpModal(false);
    setOtpActionRequired("");
  };

  const getGoogleLink = () => {
    const { VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_AUTHORIZED_REDIRECT_URI } =
      import.meta.env;
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      redirect_uri: VITE_GOOGLE_AUTHORIZED_REDIRECT_URI,
      client_id: VITE_GOOGLE_CLIENT_ID,
      access_type: "offline",
      response_type: "code",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
    };

    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  };

  return (
    <>
      <div className="clientAuth">
        <ToastContainer />
        <div className="clientAuth__contain">
          <h3 className="clientAuth__title">Login</h3>
          <p className="clientAuth__create">
            New here?
            <Link to="/register"> Create an account</Link>
          </p>
          <form className="clientAuth__form" onSubmit={handleFormSubmit}>
            <label
              className="clientAuth__form__email-label"
              htmlFor="clientLoginEmail"
            >
              Email
            </label>
            <input
              className="clientAuth__form__email-input"
              type="email"
              id="clientLoginEmail"
              name="email"
              value={dataClientLogin.email}
              onChange={handleChangeValue}
              placeholder="Email address"
              disabled={isLoading}
            />
            <label
              className="clientAuth__form__password-label"
              htmlFor="clientLoginPassword"
            >
              Password
            </label>
            <div className="clientAuth__form__password-contain">
              <input
                className="clientAuth__form__password-input"
                type={showPassword ? "text" : "password"}
                id="clientLoginPassword"
                name="password"
                value={dataClientLogin.password}
                onChange={handleChangeValue}
                placeholder="Password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="clientAuth__form__password-toggle"
                onClick={ToggleShowPassword}
                disabled={isLoading}
              >
                {showPassword ? (
                  <FaEyeSlash className="clientAuth__form__password-icon" />
                ) : (
                  <FaEye className="clientAuth__form__password-icon" />
                )}
              </button>
            </div>{" "}
            <Link
              to="/forgot-password"
              className="clientAuth__form__password-forget"
            >
              Forgot password?
            </Link>
            <button
              className="clientAuth__form__submit"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Đang đăng nhập..." : "Sign in"}
            </button>
          </form>
          <div className="clientAuth__or">
            <span className="clientAuth__or__horizontal"></span>
            <span className="clientAuth__or__span">OR</span>
            <span className="clientAuth__or__horizontal"></span>
          </div>
          <div className="clientAuth__google">
            <Link to={getGoogleLink()}>
              <img
                src="/google.png"
                alt="Google"
                className="clientAuth__google__img"
              />
              <span className="clientAuth__google__span">
                Continue with Google
              </span>
            </Link>{" "}
          </div>{" "}
        </div>{" "}
        {/* OTP Modal */}
        <OtpModal
          isOpen={showOtpModal}
          onClose={closeOtpModal}
          email={dataClientLogin.email}
          title="Xác thực đăng nhập"
          description="Vui lòng nhập mã OTP để hoàn tất quá trình đăng nhập."
          onSuccess={handleOtpSuccess}
          actionRequired={otpActionRequired}
        />
      </div>
    </>
  );
}
export default ClientAuth;
