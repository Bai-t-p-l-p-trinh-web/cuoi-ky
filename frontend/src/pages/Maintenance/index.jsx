import React from "react";
import apiClient from "../../utils/axiosConfig";
import { useNavigate } from "react-router-dom";
import { useMaintenanceContext } from "../../contexts/MaintenanceContext";
import "./Maintenance.css"; // Import the CSS file

function MaintenancePage() {
  const navigate = useNavigate();
  const { recheckMaintenanceStatus } = useMaintenanceContext();

  const handleRefresh = () => {
    recheckMaintenanceStatus();
    window.location.reload();
  };

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    }
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

  return (
    <div className="maintenance-container">
      <div className="maintenance-content">
        <div className="maintenance-icon">🚧</div>
        <h1 className="maintenance-title">Website Đang Bảo Trì</h1>
        <p className="maintenance-message">
          Chúng tôi đang thực hiện một số nâng cấp để mang lại trải nghiệm tốt
          hơn cho bạn. Trang web sẽ sớm hoạt động trở lại. Xin cảm ơn sự kiên
          nhẫn của bạn!
        </p>
        <div className="maintenance-actions">
          <button className="retry-button" onClick={handleRefresh}>
            Thử Lại
          </button>
          <button
            className="logout-button" // New class for logout button
            onClick={handleLogout}
          >
            Đăng Xuất
          </button>
        </div>
        {/* Optional: Footer from your CSS if needed */}
        {/* <div className="maintenance-footer">
          Liên hệ hỗ trợ nếu bạn cần gấp.
        </div> */}
      </div>
    </div>
  );
}

export default MaintenancePage;
