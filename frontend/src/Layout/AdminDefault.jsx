import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/SideBar/AdminSideBar";
import AdminHeader from "../components/Header/AdminHeader";
import "./AdminDefault.scss";

export default function AdminDefault() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminHeader />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
