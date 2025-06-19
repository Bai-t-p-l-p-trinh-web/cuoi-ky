import React, { useState } from "react";
import {
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaCog,
  FaSearch,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./AdminHeader.scss";

const AdminHeader = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Implement logout logic
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="admin-header">
      <div className="header-left">
        <div className="search-box">
          <FaSearch />
          <input type="text" placeholder="Tìm kiếm..." />
        </div>
      </div>

      <div className="header-right">
        <div className="notification-icon">
          <FaBell />
          {notifications > 0 && (
            <span className="notification-badge">{notifications}</span>
          )}
        </div>

        <div className="profile-menu">
          <button
            className="profile-button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <FaUserCircle />
            <span>Admin</span>
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="dropdown-item">
                <FaCog />
                <span>Cài đặt</span>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item logout" onClick={handleLogout}>
                <FaSignOutAlt />
                <span>Đăng xuất</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
