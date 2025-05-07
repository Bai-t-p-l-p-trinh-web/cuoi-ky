import Dashboard from "../../pages/Admin/dashboard";
import AdminDefault from "../../Layout/AdminDefault";

export const routesAdmin = [
    {
        path: "/admin",
        element: <AdminDefault/>,
        children: [
            {
                path: "dashboard",
                element: <Dashboard/>
            }
        ]
    }
]