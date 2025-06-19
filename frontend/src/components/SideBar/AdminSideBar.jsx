import React, { useState } from "react";
import {
  FaTachometerAlt,
  FaUsers,
  FaCar,
  FaShoppingCart,
  FaMoneyBillWave,
  FaChartLine,
  FaCog,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import "./AdminSideBar.scss";

const AdminSideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const sideBarItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: FaTachometerAlt },
    { to: "/admin/users", label: "Quản lý Users", icon: FaUsers },
    { to: "/admin/cars", label: "Quản lý Xe", icon: FaCar },
    { to: "/admin/orders", label: "Quản lý Orders", icon: FaShoppingCart },
    { to: "/admin/payments", label: "Thanh toán", icon: FaMoneyBillWave },
    { to: "/my_account", label: "Cài đặt", icon: FaCog },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`admin-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="logo">{!isCollapsed && <span>ADMIN PANEL</span>}</div>
        <button
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {sideBarItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-item ${isActive(item.to) ? "active" : ""}`}
              title={isCollapsed ? item.label : ""}
            >
              <div className="nav-icon">
                <Icon />
              </div>
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="admin-info">
          <div className="admin-avatar">
            <FaUsers />
          </div>
          {!isCollapsed && (
            <div className="admin-details">
              <div className="admin-name">Admin User</div>
              <div className="admin-role">Quản trị viên</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSideBar;
