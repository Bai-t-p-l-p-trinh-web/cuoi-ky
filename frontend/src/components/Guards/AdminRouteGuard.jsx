import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AdminRouteGuard = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = () => {
      const userString = localStorage.getItem("user");

      if (!userString) {
        toast.error("Vui lòng đăng nhập để truy cập admin panel");
        navigate("/login");
        return;
      }

      try {
        const user = JSON.parse(userString);

        if (!user || user.role !== "admin") {
          toast.error("Bạn không có quyền truy cập admin panel");
          navigate("/");
          return;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
        toast.error("Dữ liệu người dùng không hợp lệ");
        navigate("/login");
        return;
      }
    };

    checkAdminAccess();
  }, [navigate]);

  return children;
};

export default AdminRouteGuard;
