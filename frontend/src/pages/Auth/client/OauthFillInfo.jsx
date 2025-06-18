import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../../features/auth/authSlice";
import apiClient from "../../../utils/axiosConfig";
import "./scss/OauthFillInfo.scss";
import "react-toastify/dist/ReactToastify.css";

function OauthFillInfo() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
  });

  useEffect(() => {
    const getTempUser = async () => {
      try {
        const res = await apiClient.get("/oauth/tempUser");
        // Đảm bảo tất cả fields đều có value, không undefined
        const newUserData = {
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          avatar: res.data.avatar || "",
        };
        setUserData(newUserData);
      } catch (error) {
        console.error("Error getting temp user:", error);
        toast.error(
          error.response?.data?.message || "Không thể lấy thông tin user"
        );
        // Redirect về trang login nếu không có temp token
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };
    getTempUser();
  }, [navigate]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => {
      const newData = {
        ...prev,
        [name]: value || "",
      };
      return newData;
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userData.name) {
      toast.error("Tên người dùng không được để trống!");
      return;
    }
    if (!userData.email) {
      toast.error("Email không được để trống!");
      return;
    }
    if (!userData.phone) {
      toast.error("Số điện thoại không được để trống!");
      return;
    }

    // OAuth users không cần password
    const submitUser = {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      avatar: userData.avatar,
    };
    const loadingToastId = toast.loading("Đang cập nhật...");
    try {
      const updatingUser = await apiClient.post(
        "/oauth/updateUser",
        submitUser
      );

      toast.update(loadingToastId, {
        render:
          updatingUser.data.message ||
          "Cập nhật thông tin người dùng thành công",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      // Cập nhật Redux state với user data từ response
      if (updatingUser.data.success && updatingUser.data.data?.user) {
        const userData = updatingUser.data.data.user;
        localStorage.setItem("user", JSON.stringify(userData));
        dispatch(setUser(userData));
      }

      navigate("/");
    } catch (error) {
      console.error("Update user error:", error); // Debug log
      console.error("Error response:", error.response?.data); // Debug log
      toast.update(loadingToastId, {
        render: error.response?.data?.message || "Cập nhật thông tin thất bại!",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };
  return (
    <>
      <div className="fillInfo">
        <ToastContainer />
        {isLoading ? (
          <div className="fillInfo__loading">
            <p>Đang tải thông tin...</p>
          </div>
        ) : (
          <>
            <div className="fillInfo__avatar">
              <img
                src={
                  userData.avatar ||
                  "https://static-00.iconduck.com/assets.00/avatar-default-icon-2048x2048-h6w375ur.png"
                }
                alt="avatar"
              />
            </div>
            <form className="fillInfo__user">
              <div className="fillInfo__box">
                <label
                  className="fillInfo__user__name__label"
                  htmlFor="oauth2_name"
                >
                  Tên
                </label>
                <input
                  autoComplete="username"
                  required
                  type="text"
                  value={userData.name}
                  className="fillInfo__user__name"
                  id="oauth2_name"
                  name="name"
                  onChange={handleChange}
                />
              </div>

              <div className="fillInfo__box">
                <label
                  className="fillInfo__user__phone__label"
                  htmlFor="oauth2_phone"
                >
                  Số điện thoại
                </label>
                <input
                  required
                  type="text"
                  value={userData.phone}
                  className="fillInfo__user__phone"
                  id="oauth2_phone"
                  name="phone"
                  onChange={handleChange}
                />
              </div>

              <div className="fillInfo__box">
                <label
                  className="fillInfo__user__email__label"
                  htmlFor="oauth2_email"
                >
                  Email
                </label>
                <input
                  disabled
                  required
                  type="email"
                  value={userData.email}
                  className="fillInfo__user__email"
                  id="oauth2_email"
                  name="email"
                  onChange={handleChange}
                />
              </div>

              <div className="fillInfo__box">
                <button
                  type="button"
                  className="fillInfo__user__button"
                  onClick={handleSubmit}
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </>
  );
}
export default OauthFillInfo;
