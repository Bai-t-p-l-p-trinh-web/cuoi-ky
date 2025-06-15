import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import apiClient from "../utils/axiosConfig";

const MaintenanceContext = createContext();

export const useMaintenanceContext = () => {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error(
      "useMaintenanceContext must be used within MaintenanceProvider"
    );
  }
  return context;
};

export const MaintenanceProvider = ({ children }) => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const isCheckingRef = useRef(false);

  const checkMaintenanceStatus = useCallback(async () => {
    if (isCheckingRef.current) {
      console.log("Maintenance check already in progress, skipping...");
      return;
    }

    console.log("🔍 Checking maintenance status...");
    isCheckingRef.current = true;
    setIsChecking(true);

    try {
      // check if server is in maintenance
      const response = await apiClient.get("/health");
      console.log("✅ Health check successful:", response.data);
      setIsMaintenanceMode(false);
    } catch (error) {
      console.log(
        "❌ Health check failed:",
        error.response?.status,
        error.response?.data
      );

      if (
        error.response?.status === 503 &&
        error.response?.data?.maintenanceMode
      ) {
        console.log("🚧 Maintenance mode detected");
        setIsMaintenanceMode(true);
      } else {
        // Other errors (network, server down, etc.) - treat as not maintenance
        console.log("🌐 Network/Server error, treating as non-maintenance");
        setIsMaintenanceMode(false);
      }
    } finally {
      isCheckingRef.current = false;
      setIsChecking(false);
    }
  }, []);
  useEffect(() => {
    console.log("🚀 MaintenanceProvider mounted, checking status...");
    // Only check once when the app starts
    checkMaintenanceStatus();

    // No automatic interval - user must manually retry
  }, [checkMaintenanceStatus]);

  const value = {
    isMaintenanceMode,
    isChecking,
    recheckMaintenanceStatus: checkMaintenanceStatus,
  };

  return (
    <MaintenanceContext.Provider value={value}>
      {children}
    </MaintenanceContext.Provider>
  );
};
