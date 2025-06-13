import Default from "../../Layout/Default";
import BanXe from "../../pages/BanXe";
import ChiTietXe from "../../pages/ChiTietXe";
import GioiThieu from "../../pages/GioiThieu";
import Home from "../../pages/Home";
import BlogXeHoi from "../../pages/BlogXeHoi";
import ClientAuth from "../../pages/Auth/client";
import Message from "../../pages/Message";
import ClientRegister from "../../pages/Auth/client/ClientRegister";
import ForgotPassword from "../../pages/Auth/client/ForgotPassword";
import OauthFillInfo from "../../pages/Auth/client/OauthFillInfo";
import MyAccount from "../../pages/MyAccount";
import DashBoard from "../../pages/MyAccount/child/DashBoard";
import ManageCar from "../../pages/MyAccount/child/ManageCar";
import Sales from "../../pages/MyAccount/child/Sales";
import Notify from "../../pages/MyAccount/child/Notify";
import Insight from "../../pages/MyAccount/child/Insight";
import History from "../../pages/MyAccount/child/History";
import Faq from "../../pages/MyAccount/child/Faq";
import RequestForm from "../../pages/RequestForm/child/RequestForm";
import RequestDetail from "../../pages/RequestForm";
import RequestInfo from "../../pages/RequestForm/child/RequestInfo";
import RequestVerify from "../../pages/RequestForm/child/RequestVerify";
import RequestDone from "../../pages/RequestForm/child/RequestDone";
import Error404 from "../../pages/Error404";
import EditCar from "../../pages/MyAccount/child/EditCar";

export const routes = [
  {
    path: "/blog-xe-hoi",
    element: <BlogXeHoi />,
  },
  {
    path: "/",
    element: <Default />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "ban-xe",
        element: <BanXe />,
      },
      {
        path: "gioi-thieu",
        element: <GioiThieu />,
      },
      {
        path: "login",
        element: <ClientAuth />,
      },
      {
        path: "register",
        element: <ClientRegister />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "chat",
        element: <Message />,
      },
      {
        path: "fill-info",
        element: <OauthFillInfo />,
      },
      {
        path: "my_account",
        element: <MyAccount />,
        children: [
          {
            index: true,
            element: <DashBoard />,
          },
          {
            path: "manage-car",
            element: <ManageCar />,
          },
          {
            path: "statistics/sales",
            element: <Sales />,
          },
          {
            path: "statistics/insights",
            element: <Insight />,
          },
          {
            path: "inspection-history",
            element: <History />,
          },
          {
            path: "notifications",
            element: <Notify />,
          },
          {
            path: "faq",
            element: <Faq />,
          },
          {
              path : "edit-car/:slugCar",
              element: <EditCar/>
          }
        ]
      },
      {
        path : "request-form",
        element : <RequestForm/>
      },
      {
          path : "request-detail/:slugRequest",
          element : <RequestDetail/>,
          children : [
              {
                  path : "info",
                  element : <RequestInfo/>
              },
              {
                  path : "verify",
                  element : <RequestVerify/>
              },
              {
                  path : "done",
                  element : <RequestDone/>
              },
              {
                  index : true,
                  path : "*",
                  element : <Error404/>
              }
          ]
      },
      {
        path: ":slugCar",
        element: <ChiTietXe />,
      },
    ],
  },
];
