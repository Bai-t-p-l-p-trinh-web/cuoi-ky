import Default from "../../Layout/Default";
import BanXe from "../../pages/BanXe";
import ChiTietXe from "../../pages/ChiTietXe";
import GioiThieu from "../../pages/GioiThieu";
import Home from "../../pages/Home";
import VayMuaXe from "../../pages/VayMuaXe";
import Error404 from "../../pages/Error404";
import BlogXeHoi from "../../pages/BlogXeHoi";
export const routes = [
    {
        path: "/blog-xe-hoi",
        element: <BlogXeHoi/>
    },
    {
        path: "/",
        element: <Default/>,
        children: [
            {
                index: true,
                element: <Home/>
            },
            {
                path: "ban-xe",
                element: <BanXe/>
            },
            {
                path: "gioi-thieu",
                element: <GioiThieu/>
            },
            {
                path: "vay-mua-xe",
                element: <VayMuaXe/>
            },
            {
                path: ":slugCar",
                element: <ChiTietXe/>
            }
        ]
    }
]