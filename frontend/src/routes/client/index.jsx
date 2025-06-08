import Default from "../../Layout/Default";
import BanXe from "../../pages/BanXe";
import ChiTietXe from "../../pages/ChiTietXe";
import GioiThieu from "../../pages/GioiThieu";
import Home from "../../pages/Home";
import BlogXeHoi from "../../pages/BlogXeHoi";
import ClientAuth from "../../pages/Auth/client";
import Message from "../../pages/Message";
import ClientRegister from "../../pages/Auth/client/ClientRegister";
import OauthFillInfo from "../../pages/Auth/client/OauthFillInfo";
import MyAccount from "../../pages/myAccount";
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
                path: "login",
                element: <ClientAuth/>
            },
            {
                path: "register",
                element: <ClientRegister/>
            },
            {
                path: "chat",
                element: <Message/>
            },
            {
                path: "fill-info",
                element : <OauthFillInfo/>
            },
            {
                path: "my_account",
                element: <MyAccount/>
            },
            {
                path: ":slugCar",
                element: <ChiTietXe/>
            }
        ]
    }
]