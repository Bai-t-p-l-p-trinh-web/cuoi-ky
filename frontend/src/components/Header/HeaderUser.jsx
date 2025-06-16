import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/axiosConfig";
import { toast } from "react-toastify";

function HeaderUser() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");

      dispatch(logout());
      navigate("/");
      toast.success("Đăng xuất thành công!");
    } catch (error) {
      console.error("Logout error:", error);
      dispatch(logout());
      navigate("/");
      toast.error(
        "Đã xảy ra lỗi khi đăng xuất, nhưng bạn đã được đăng xuất khỏi thiết bị này"
      );
    }
  };

  if (user) {
    return (
      <>
        <ul className="header__dropdownUser">
          <li className="header__dropdownUser-item">
            <Link to="/my_account">Tài khoản của tôi</Link>
          </li>
          <li className="header__dropdownUser-item">
            <Link to="/ban-xe">Đăng tin bán xe</Link>
          </li>
          <li className="header__dropdownUser-item">
            <Link to="/chat">Tin nhắn</Link>
          </li>
          <li className="header__dropdownUser-item">
            <button onClick={handleLogout} className="logout-btn">
              Đăng xuất
            </button>
          </li>
        </ul>
      </>
    );
  }

  return (
    <>
      <ul className="header__dropdownUser">
        <li className="header__dropdownUser-item">
          <Link to="/register">Đăng ký</Link>
        </li>
        <li className="header__dropdownUser-item">
          <Link to="/login">Đăng nhập</Link>
        </li>
      </ul>
    </>
  );
}

export default HeaderUser;
