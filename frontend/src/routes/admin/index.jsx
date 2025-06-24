import { Navigate } from "react-router-dom";
import { lazy } from "react";
import AdminRouteGuard from "../../components/Guards/AdminRouteGuard";
import Error404 from "../../pages/Error404";

// Lazy load admin components để giảm bundle size
const AdminDashboard = lazy(() =>
  import("../../pages/Admin/AdminDashboard/AdminDashboard")
);
const AdminDefault = lazy(() => import("../../Layout/AdminDefault"));
const AdminOrderManagement = lazy(() =>
  import("../../pages/Admin/AdminOrderManagement/AdminOrderManagement")
);
const AdminUserManagement = lazy(() =>
  import("../../pages/Admin/AdminUserManagement/AdminUserManagement")
);
const AdminCarManagement = lazy(() =>
  import("../../pages/Admin/AdminCarManagement/AdminCarManagement")
);
const AdminRequestManagement = lazy(() =>
  import("../../pages/Admin/AdminRequestManagement/AdminRequestManagement")
);
const AdminPaymentManagement = lazy(() =>
  import("../../pages/Admin/AdminPaymentManagement/AdminPaymentManagement")
);
const PaymentVerificationTest = lazy(() =>
  import("../../components/test/PaymentVerificationTest")
);

export const routesAdmin = [
  {
    path: "/admin",
    element: (
      <AdminRouteGuard>
        <AdminDefault />
      </AdminRouteGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "users",
        element: <AdminUserManagement />,
      },
      {
        path: "cars",
        element: <AdminCarManagement />,
      },
      {
        path: "requests",
        element: <AdminRequestManagement />,
      },
      {
        path: "orders",
        element: <AdminOrderManagement />,
      },
      {
        path: "payments",
        element: <AdminPaymentManagement />,
      },
      {
        path: "test-payment",
        element: <PaymentVerificationTest />,
      },
      {
        path: "*",
        element: <Error404 />,
      },
    ],
  },
];
