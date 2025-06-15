import Dashboard from "../../pages/Admin/dashboard";
import AdminDefault from "../../Layout/AdminDefault";
import Error404 from "../../pages/Error404";

export const routesAdmin = [
  {
    path: "/admin",
    element: <AdminDefault />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "*",
        element: <Error404 />,
      },
    ],
  },
];
