import { useRoutes } from "react-router-dom";
import { Suspense, useMemo } from "react";
import "../../routes/client";
import { routes } from "../../routes/client";
import { routesAdmin } from "../../routes/admin";

// Loading spinner component
const LoadingSpinner = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "50vh",
      fontSize: "18px",
      color: "#666",
    }}
  >
    <div
      style={{
        border: "3px solid #f3f3f3",
        borderTop: "3px solid #3498db",
        borderRadius: "50%",
        width: "30px",
        height: "30px",
        animation: "spin 1s linear infinite",
        marginRight: "10px",
      }}
    ></div>
    Loading...
  </div>
);

function AllRoutes() {
  // Memoize routes để tránh re-render không cần thiết
  const elementRoutes = useMemo(() => [...routes, ...routesAdmin], []);
  const elements = useRoutes(elementRoutes);

  return <Suspense fallback={<LoadingSpinner />}>{elements}</Suspense>;
}
export default AllRoutes;
