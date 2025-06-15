import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./scss/ClientRegister.scss";
import { useFetchUserInfo } from "../../../hooks/useFetchUserInfo";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import apiClient from "../../../utils/axiosConfig";
import OtpModal from "../../../components/OtpModal";

function ClientRegister() {
  const { user, loading, error } = useFetchUserInfo();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpActionRequired, setOtpActionRequired] = useState("");
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    rePassword: "",
  });

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

  const handleChangeValue = (e) => {
    const { name, value } = e.target;

    setRegisterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ToggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const comparePassword = () => {
    const { password, rePassword } = registerData;
    if (password !== rePassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      setRegisterData((prev) => ({
        ...prev,
        password: "",
        rePassword: "",
      }));
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (user) {
      toast.error("Người dùng đã đăng nhập rồi !");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }
  }, [user]);

  const validateForm = () => {
    const { name, email, password, rePassword } = registerData;

    let isValid = true;
    let resetDataObject = { name, email, password, rePassword };

    // Kiểm tra trống
    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !rePassword.trim()
    ) {
      toast.error("Email, tên và mật khẩu không được bỏ trống");
      isValid = false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Định dạng email không hợp lệ");
      resetDataObject.email = "";
      isValid = false;
    }

    // Validate password
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error(
        "Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa và 1 ký tự đặc biệt"
      );
      resetDataObject.password = resetDataObject.rePassword = "";
      return false;
    }

    // Kiểm tra password match
    if (!comparePassword()) {
      return false;
    }

    setRegisterData(resetDataObject);

    return isValid;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    //frontend validation
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post("/auth/register", {
        name: registerData.name.trim(),
        email: registerData.email.trim(),
        password: registerData.password.trim(),
      });

      const responseData = response.data;

      if (responseData.success) {
        toast.success(responseData.message);
        if (responseData.data?.actionRequired) {
          setOtpActionRequired(responseData.data.actionRequired);
          setShowOtpModal(true);
        }
      } else {
        toast.error(responseData.message);
        if (responseData.error_code === "WEAK_PASSWORD") {
          setRegisterData((prev) => ({
            ...prev,
            password: "",
            rePassword: "",
          }));
        } else if (responseData.data?.actionRequired) {
          setOtpActionRequired(responseData.data.actionRequired);
          setShowOtpModal(true);
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (error.response?.data) {
        const errorData = error.response.data;
        toast.error(errorData.message || "Đã xảy ra lỗi khi đăng ký");

        if (errorData.error_code === "WEAK_PASSWORD") {
          setRegisterData((prev) => ({
            ...prev,
            password: "",
            rePassword: "",
          }));
        } else if (errorData.data?.actionRequired) {
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
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };
  const closeOtpModal = () => {
    setShowOtpModal(false);
    setOtpActionRequired("");
  };

  return (
    <>
      <div className="register">
        <ToastContainer />
        <div className="register__box">
          <div className="register__contain">
            <h3 className="register__title">Create an Account</h3>
            <p className="register__introduction">
              Join now to streamline your experience from day one
            </p>
            <form className="register__form" onSubmit={handleFormSubmit}>
              <label
                className="register__form__name-label"
                htmlFor="registerName"
              >
                Họ và tên
              </label>
              <input
                type="text"
                name="name"
                className="register__form__name-input"
                placeholder="Họ và tên"
                id="registerName"
                onChange={handleChangeValue}
                value={registerData.name}
                disabled={isLoading}
              />
              <label
                className="register__form__email-label"
                htmlFor="registerEmail"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                className="register__form__email-input"
                placeholder="Email"
                id="registerEmail"
                onChange={handleChangeValue}
                value={registerData.email}
                disabled={isLoading}
              />
              <label
                className="register__form__password-label"
                htmlFor="registerPassword"
              >
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="register__form__password-input"
                placeholder="Password"
                id="registerPassword"
                onChange={handleChangeValue}
                value={registerData.password}
                disabled={isLoading}
              />
              <label
                className="register__form__Repassword-label"
                htmlFor="registerRePassword"
              >
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="rePassword"
                className="register__form__Repassword-input"
                placeholder="Confirm Password"
                id="registerRePassword"
                onChange={handleChangeValue}
                autoComplete="new-password"
                value={registerData.rePassword}
                disabled={isLoading}
              />
              <div className="register__form__show-password-container">
                <button
                  type="button"
                  className="register__form__show-password-toggle"
                  onClick={ToggleShowPassword}
                  disabled={isLoading}
                  style={{
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.6 : 1,
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                <span
                  className="register__form__show-password-text"
                  style={{
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.6 : 1,
                  }}
                >
                  {showPassword ? "Hide Password" : "Show Password"}
                </span>
              </div>
              <button
                className="register__form__submit"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Đang đăng ký..." : "Register"}
              </button>
            </form>
            <div className="register__or">
              <span className="register__or-horizontal"></span>
              <span className="register__or-span">Or Register With</span>
              <span className="register__or-horizontal"></span>
            </div>
            <div className="register__google">
              <Link to={getGoogleLink()}>
                <img
                  src="/google.png"
                  alt="Google"
                  className="register__google__icon"
                />
                <span className="register__google__span">
                  Continue with Google
                </span>
              </Link>
            </div>
            <p className="register__login">
              Already Have An Account?
              <Link to="/login"> Log in</Link>
            </p>
          </div>
          <div className="register__img">
            <img
              className="register__img-img"
              src="/register.jpg"
              alt="register"
            />
          </div>{" "}
        </div>
        {/* OTP Modal */}
        <OtpModal
          isOpen={showOtpModal}
          onClose={closeOtpModal}
          email={registerData.email}
          title="Xác thực tài khoản"
          description="Vui lòng nhập mã OTP để xác thực tài khoản của bạn."
          onSuccess={handleOtpSuccess}
          actionRequired={otpActionRequired}
        />
      </div>
    </>
  );
}
export default ClientRegister;
