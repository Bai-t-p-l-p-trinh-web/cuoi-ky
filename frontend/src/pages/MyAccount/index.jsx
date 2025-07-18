import { CiLogout } from "react-icons/ci";
import { MdDashboard, MdManageAccounts } from "react-icons/md";
import { FcStatistics, FcInspection } from "react-icons/fc";
import { TbEyeShare } from "react-icons/tb";
import { IoIosNotificationsOutline } from "react-icons/io";
import { FaQuestion, FaCreditCard } from "react-icons/fa6";
import { FaShoppingCart, FaUniversity } from "react-icons/fa";
import { TbPencilCheck } from "react-icons/tb";
import { PiCarLight } from "react-icons/pi";
import { MdPayment } from "react-icons/md";
import { useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useFetchUserInfo } from "../../hooks/useFetchUserInfo";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import "./scss/MyAccount.scss";
import { useEffect } from "react";

function MyAccount() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useFetchUserInfo();

  const handleLogout = () => {
    const loadingToastLogout = toast.loading("Đang đăng xuất ... ");

    const logoutUser = async () => {
      try {
        const userLogout = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/api/v1/auth/logout`,
          {},
          {
            withCredentials: true,
          }
        );
        toast.update(loadingToastLogout, {
          render: "Đăng xuất thành công",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });

        setTimeout(() => {
          dispatch(logout());
          navigate("/");
        }, 3000);
      } catch (error) {
        toast.update(loadingToastLogout, {
          render: error.response?.data?.message || "Đăng xuất thất bại",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    };
    logoutUser();
  };

  return (
    <>
      <div className="myAccount">
        <ToastContainer />
        <div className="myAccount__pages">
          <div className="myAccount__pages__card">
            {loading ? (
              <>
                <div className="myAccount__pages__card__avatar__contain">
                  <Skeleton className="myAccount__pages__card__avatar" />
                </div>

                <div className="myAccount__pages__card__info">
                  <Skeleton
                    width={70}
                    height={10}
                    className="myAccount__pages__card__info__username"
                  />
                  <Skeleton
                    width={160}
                    height={10}
                    className="myAccount__pages__card__info__email"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="myAccount__pages__card__avatar__contain">
                  <img
                    src={
                      user?.avatar ||
                      "https://greekherald.com.au/wp-content/uploads/2020/07/default-avatar.png"
                    }
                    className="myAccount__pages__card__avatar"
                  />
                </div>

                <div className="myAccount__pages__card__info">
                  <span className="myAccount__pages__card__info__username">
                    {user?.name || ""}
                  </span>
                  <p className="myAccount__pages__card__info__email">
                    {user?.email || ""}
                  </p>
                </div>
              </>
            )}
          </div>
          <ul className="myAccount__pages__list">
            <li className="myAccount__pages__item">
              <Link className="myAccount__pages__item__link" to="">
                <MdDashboard className="myAccount__pages__item__link__svg" />
                <span className="myAccount__pages__item__span">
                  Trang tổng quan
                </span>
              </Link>
            </li>
            <li className="myAccount__pages__item">
              <Link className="myAccount__pages__item__link" to="manage-car">
                <FcStatistics className="myAccount__pages__item__link__svg" />
                <span className="myAccount__pages__item__span">
                  Quản lý đăng bán xe
                </span>
              </Link>
            </li>
            <li className="myAccount__pages__item">
              <Link
                className="myAccount__pages__item__link"
                to="statistics/sales"
              >
                <PiCarLight className="myAccount__pages__item__link__svg" />
                <span className="myAccount__pages__item__span">
                  Thống kê bán hàng
                </span>
              </Link>
            </li>
            <li className="myAccount__pages__item">
              <Link
                className="myAccount__pages__item__link"
                to="statistics/insights"
              >
                <TbEyeShare className="myAccount__pages__item__link__svg" />
                <span className="myAccount__pages__item__span">
                  Thống kê lượt xem / tương tác
                </span>
              </Link>
            </li>{" "}
            <li className="myAccount__pages__item">
              <Link
                className="myAccount__pages__item__link"
                to="inspection-history"
              >
                <FcInspection className="myAccount__pages__item__link__svg" />
                <span className="myAccount__pages__item__span">
                  Thông tin / lịch sử kiểm định
                </span>
              </Link>
            </li>
            <li className="myAccount__pages__item">
              <Link className="myAccount__pages__item__link" to="order-history">
                <FaShoppingCart className="myAccount__pages__item__link__svg" />
                <span className="myAccount__pages__item__span">
                  Lịch sử đơn hàng
                </span>
              </Link>
            </li>
            <li className="myAccount__pages__item">
              <Link
                className="myAccount__pages__item__link"
                to="payment-history"
              >
                <MdPayment className="myAccount__pages__item__link__svg" />
                <span className="myAccount__pages__item__span">
                  Lịch sử giao dịch
                </span>
              </Link>
            </li>
            <li className="myAccount__pages__item">
              <Link className="myAccount__pages__item__link" to="notifications">
                <IoIosNotificationsOutline className="myAccount__pages__item__link__svg" />
                <span className="myAccount__pages__item__span">Thông báo</span>
              </Link>
            </li>
            <li className="myAccount__pages__item">
              <Link className="myAccount__pages__item__link" to="faq">
                <FaQuestion className="myAccount__pages__item__link__svg" />
                <span className="myAccount__pages__item__span">
                  Hướng dẫn / FAQ
                </span>
              </Link>
            </li>{" "}
            <li className="myAccount__pages__item">
              <Link className="myAccount__pages__item__link" to="bank-info">
                <FaUniversity className="myAccount__pages__item__link__svg" />
                <span className="myAccount__pages__item__span">
                  Thông tin ngân hàng
                </span>
              </Link>
            </li>
            {user && user.role === "staff" && (
              <li className="myAccount__pages__item">
                <Link
                  className="myAccount__pages__item__link"
                  to="examine_requests"
                >
                  <TbPencilCheck className="myAccount__pages__item__link__svg" />
                  <span className="myAccount__pages__item__span">
                    Kiểm tra xe
                  </span>
                </Link>
              </li>
            )}
            <li className="myAccount__pages__item logout">
              <button
                className="myAccount__pages__logout"
                onClick={handleLogout}
              >
                <CiLogout className="myAccount__pages__logout__svg" />
                <span className="myAccount__pages__logout__span">
                  Đăng xuất
                </span>
              </button>
            </li>
          </ul>
        </div>
        <div className="myAccount__inside">
          <Outlet />
        </div>
      </div>
    </>
  );
}
export default MyAccount;
