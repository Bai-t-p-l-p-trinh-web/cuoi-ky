import AllRoutes from "./components/AllRoutes";
import "./App.css";
import {
  MaintenanceProvider,
  useMaintenanceContext,
} from "./contexts/MaintenanceContext";
import MaintenancePage from "./pages/Maintenance";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, fetchUser } from "./features/auth/authSlice";
import { useFetchUserInfo } from "./hooks/useFetchUserInfo";
import { toast } from "react-toastify";

const Spinner = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontSize: "20px",
      color: "#333",
    }}
  >
    <div
      style={{
        border: "4px solid #f3f3f3",
        borderTop: "4px solid #3498db",
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        animation: "spin 1s linear infinite",
      }}
    ></div>
    <span style={{ marginLeft: "10px" }}>Loading...</span>
  </div>
);

function AppContent() {
  const { isMaintenanceMode, isChecking } = useMaintenanceContext();
  const location = useLocation();
  const dispatch = useDispatch();

  useFetchUserInfo();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const oauthSuccess = urlParams.get("oauth_success");
    const userDataParam = urlParams.get("user");
    if (oauthSuccess === "true" && userDataParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataParam));

        localStorage.setItem("user", JSON.stringify(userData));
        dispatch(setUser(userData));
        dispatch(fetchUser());

        toast.success("Đăng nhập Google thành công!");

        // Redirect based on user role
        setTimeout(() => {
          if (userData.role === "admin") {
            window.location.href = "/admin/dashboard";
          } else {
            window.location.href = "/";
          }
        }, 1500);

        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      } catch (error) {
        console.error("Error parsing OAuth user data:", error);
        toast.error("Có lỗi xảy ra trong quá trình đăng nhập");
      }
    }
  }, [location.search, dispatch]);

  let isAdmin = false;
  const userString = localStorage.getItem("user");
  if (userString) {
    try {
      const user = JSON.parse(userString);
      if (user && (user.role === "admin" || user.role === "ADMIN")) {
        isAdmin = true;
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage in App.jsx:", e);
      localStorage.removeItem("user");
    }
  }

  if (isChecking) {
    return <Spinner />;
  }

  if (isMaintenanceMode) {
    if (isAdmin) {
      return <AllRoutes />;
    }
    if (location.pathname === "/login") {
      return <AllRoutes />;
    }
    return <MaintenancePage />;
  }

  // Not in maintenance mode
  return <AllRoutes />;
}

function App() {
  return (
    <MaintenanceProvider>
      <AppContent />
    </MaintenanceProvider>
  );
}

export default App;
