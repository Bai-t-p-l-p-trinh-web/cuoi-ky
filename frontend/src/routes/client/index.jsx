import Default from "../../Layout/Default";
import BanXe from "../../pages/BanXe";
import GioiThieu from "../../pages/GioiThieu";
import Home from "../../pages/Home";
import VayMuaXe from "../../pages/VayMuaXe";

export const routes = [
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
            }
        ]
    }
]