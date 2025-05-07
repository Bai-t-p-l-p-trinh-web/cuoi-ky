import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/SideBar/AdminSideBar";

export default function AdminLayout() {
  return (
    <div className="flex items-center justify-center bg-[#141414]">
        <AdminSidebar />
        <div className="flex-1 p-4">
            <Outlet />
        </div>
    </div>
  );
}
