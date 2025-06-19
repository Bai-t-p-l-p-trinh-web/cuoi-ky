import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import apiClient from "../../../utils/axiosConfig";
import { setUser } from "../../../features/auth/authSlice";
import "./scss/SetupPassword.scss";

const SetupPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Kiểm tra user có phải OAuth user và chưa set password
  React.useEffect(() => {
    if (
      !currentUser ||
      !currentUser.isOAuthUser ||
      currentUser.hasSetPassword
    ) {
      navigate("/my_account");
      toast.error("Bạn không có quyền truy cập trang này");
    }
  }, [currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate
      if (!formData.newPassword || !formData.confirmPassword) {
        toast.error("Vui lòng điền đầy đủ thông tin");
        return;
      }

      if (!validatePassword(formData.newPassword)) {
        toast.error(
          "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
        );
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        toast.error("Mật khẩu xác nhận không khớp");
        return;
      }

      const response = await apiClient.post("/auth/set-oauth-password", {
        userId: currentUser.id,
        newPassword: formData.newPassword,
      });
      if (response.data.success) {
        toast.success("Thiết lập mật khẩu thành công!");

        // Update user data in localStorage and Redux
        const updatedUser = { ...currentUser, hasSetPassword: true };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        dispatch(setUser(updatedUser));

        navigate("/my_account");
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Setup password error:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Có lỗi xảy ra khi thiết lập mật khẩu");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="setup-password-page">
      <div className="setup-password-container">
        <div className="setup-password-header">
          <h2>Thiết lập mật khẩu</h2>
          <p>Thiết lập mật khẩu để có thể đăng nhập bằng email và mật khẩu</p>
        </div>

        <form onSubmit={handleSubmit} className="setup-password-form">
          <div className="form-group">
            <label htmlFor="newPassword">Mật khẩu mới</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu mới"
                required
              />{" "}
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Xác nhận mật khẩu mới"
                required
              />{" "}
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <AiOutlineEyeInvisible />
                ) : (
                  <AiOutlineEye />
                )}
              </button>
            </div>
          </div>

          <div className="password-requirements">
            <p>Yêu cầu mật khẩu:</p>
            <ul>
              <li>Ít nhất 8 ký tự</li>
              <li>Ít nhất 1 chữ hoa (A-Z)</li>
              <li>Ít nhất 1 chữ thường (a-z)</li>
              <li>Ít nhất 1 số (0-9)</li>
              <li>Ít nhất 1 ký tự đặc biệt (@$!%*?&)</li>
            </ul>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-cancel"
              onClick={() => navigate("/my_account")}
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Đang thiết lập..." : "Thiết lập mật khẩu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetupPassword;
