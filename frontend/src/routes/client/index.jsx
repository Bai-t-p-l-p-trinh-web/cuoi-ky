import Default from "../../Layout/Default";
import BanXe from "../../pages/BanXe";
import ChiTietXe from "../../pages/ChiTietXe";
import GioiThieu from "../../pages/GioiThieu";
import Home from "../../pages/Home";
import ClientAuth from "../../pages/Auth/client";
import Message from "../../pages/Message";
import ClientRegister from "../../pages/Auth/client/ClientRegister";
import ForgotPassword from "../../pages/Auth/client/ForgotPassword";
import ChangeEmail from "../../pages/Auth/client/ChangeEmail";
import ChangePassword from "../../pages/Auth/client/ChangePassword";
import SetupPassword from "../../pages/Auth/client/SetupPassword";
import OauthFillInfo from "../../pages/Auth/client/OauthFillInfo";
import MyAccount from "../../pages/MyAccount";
import DashBoard from "../../pages/MyAccount/child/DashBoard";
import ManageCar from "../../pages/MyAccount/child/ManageCar";
import Sales from "../../pages/MyAccount/child/Sales";
import Notify from "../../pages/MyAccount/child/Notify";
import Insight from "../../pages/MyAccount/child/Insight";
import History from "../../pages/MyAccount/child/History";
import Faq from "../../pages/MyAccount/child/Faq";
import PaymentHistory from "../../pages/MyAccount/child/PaymentHistory";
import MaintenancePage from "../../pages/Maintenance";
import RequestForm from "../../pages/RequestForm/child/RequestForm";
import RequestDetail from "../../pages/RequestForm";
import RequestInfo from "../../pages/RequestForm/child/RequestInfo";
import RequestVerify from "../../pages/RequestForm/child/RequestVerify";
import RequestDone from "../../pages/RequestForm/child/RequestDone";
import Error404 from "../../pages/Error404";
import EditCar from "../../pages/MyAccount/child/EditCar";
import TransactionHistory from "../../pages/TransactionHistory";

// New pages for order management system
import OrderManagement from "../../pages/OrderManagement/OrderManagement";
import BankInfoManagement from "../../pages/BankInfoManagement/BankInfoManagement";
import RefundPage from "../../pages/RefundPage/RefundPage";

// Footer Pages
import DieuKhoanSuDung from "../../pages/FooterPages/DieuKhoanSuDung";
import ChinhSachQuyenRiengTu from "../../pages/FooterPages/ChinhSachQuyenRiengTu";
import CauHoiThuongGap from "../../pages/FooterPages/CauHoiThuongGap";
import LienHe from "../../pages/FooterPages/LienHe";
import CoHoiViecLam from "../../pages/FooterPages/CoHoiViecLam";
import SellerInfo from "../../pages/SellerInfo";

export const routes = [
  {
    path: "/maintenance",
    element: <MaintenancePage />,
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
        path: "change-email",
        element: <ChangeEmail />,
      },
      {
        path: "change-password",
        element: <ChangePassword />,
      },
      {
        path: "setup-password",
        element: <SetupPassword />,
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
            path: "edit-car/:slugCar",
            element: <EditCar />,
          },
          {
            path: "orders",
            element: <OrderManagement />,
          },
          {
            path: "bank-info",
            element: <BankInfoManagement />,
          },
        ],
      },
      {
        path: "request-form",
        element: <RequestForm />,
      },
      {
        path: "request-detail/:slugRequest",
        element: <RequestDetail />,
        children: [
          {
            path: "info",
            element: <RequestInfo />,
          },
          {
            path: "verify",
            element: <RequestVerify />,
          },
          {
            path: "done",
            element: <RequestDone />,
          },
          {
            index: true,
            path: "*",
            element: <Error404 />,
          },
        ],
      },
      {
        path: "chi-tiet-xe/:slugCar",
        element: <ChiTietXe />,
      },
      {
        path: "refund/:orderId",
        element: <RefundPage />,
      },
      {
        path: "transaction-history",
        element: <TransactionHistory />,
      },
      {
        path: "dieu-khoan-su-dung",
        element: <DieuKhoanSuDung />,
      },
      {
        path: "chinh-sach-quyen-rieng-tu",
        element: <ChinhSachQuyenRiengTu />,
      },
      {
        path: "cau-hoi-thuong-gap",
        element: <CauHoiThuongGap />,
      },
      {
        path: "lien-he",
        element: <LienHe />,
      },
      {
        path: "co-hoi-viec-lam",
        element: <CoHoiViecLam />,
      },
      {
        path: "nguoi-ban/:slugSeller",
        element: <SellerInfo/>
      },
      {
        path: "*",
        element: <Error404 />,
      },
    ],
  },
];
