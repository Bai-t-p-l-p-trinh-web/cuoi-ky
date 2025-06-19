import { Link } from "react-router-dom";
import { FaPhoneAlt, FaCar, FaAngleDown, FaBell } from "react-icons/fa";
import { CiChat1 } from "react-icons/ci";
import { MdArrowDropDown, MdAccountBox } from "react-icons/md";
import "./Header.scss";
import { MouseEnter, MouseOut } from "../../utils/Dropdown";
import { useRef } from "react";
import HeaderMuaXe from "./HeaderMuaXe";
import Dropdown from "../Dropdown";
import HeaderUser from "./HeaderUser";
import { useFetchUserInfo } from "../../hooks/useFetchUserInfo";

function Header() {
  const { user, loading, error } = useFetchUserInfo();
  // console.log(user, loading, error);
  const headerRef = useRef(null);

  return (
    <>
      <header className="header" ref={headerRef}>
        <div className="header__containner container">
          <div className="header__menuPage">
            <div className="header__menuPage__logo">
              <Link to="/">
                <img src={import.meta.env.VITE_LOGO_URL} alt="FakeAuto Logo" />
              </Link>
            </div>
            <ul className="header__menuPage__list">
              <li
                className="header__menuPage__list-item"
                onMouseEnter={(e) =>
                  MouseEnter(
                    e.currentTarget,
                    headerRef.current.getBoundingClientRect(),
                    "left",
                    20
                  )
                }
                onMouseLeave={(e) => {
                  MouseOut(e.currentTarget);
                }}
              >
                <Link to="/">
                  Mua xe
                  <span>
                    <FaAngleDown />
                  </span>
                </Link>
                <div className="dropdown">
                  <HeaderMuaXe />
                </div>
              </li>
              <li className="header__menuPage__list-item">
                <Link to="/ban-xe">Bán xe</Link>
              </li>
              <li className="header__menuPage__list-item">
                <Link to="/gioi-thieu">Giới thiệu</Link>
              </li>

              <Dropdown />
            </ul>
          </div>
          <div className="header__menuUser">
            <div className="header__menuUser__post">
              <Link to="/ban-xe">
                <FaCar />
                <span>ĐĂNG TIN</span>
              </Link>
            </div>
            <div className="header__menuUser__contact">
              <FaPhoneAlt />
              <span>0123.456.789</span>
            </div>
            {user && !loading ? (
              <div className="header__menuUser__authenticated">
                {" "}
                {/* Notification Bell */}
                <div
                  className="header__menuUser__notification"
                  title="Thông báo"
                >
                  <FaBell />
                  <span className="notification-badge">3</span>
                </div>
                {/* Chat Link */}
                <Link
                  className="header__menuUser__chat"
                  to="/chat"
                  title="Tin nhắn"
                >
                  <CiChat1 />
                </Link>
                {/* User Account Dropdown */}
                <div
                  className="header__menuUser__myAccount"
                  onMouseEnter={(e) =>
                    MouseEnter(
                      e.currentTarget,
                      headerRef.current.getBoundingClientRect(),
                      "right",
                      30
                    )
                  }
                  onMouseLeave={(e) => {
                    MouseOut(e.currentTarget);
                  }}
                >
                  <div className="header__menuUser__myAccount__trigger">
                    <div className="user-avatar">
                      <img
                        src={
                          user.avatar ||
                          "https://ui-avatars.com/api/?name=" +
                            encodeURIComponent(user.name || "U") +
                            "&background=7967e8&color=fff&size=40"
                        }
                        alt="avatar"
                      />
                    </div>
                    <div className="user-info">
                      <span className="user-name">
                        {user.name || "Người dùng"}
                      </span>
                      <span className="user-role">Thành viên</span>
                    </div>
                    <MdArrowDropDown className="dropdown-arrow" />
                  </div>
                  <div className="dropdown">
                    <HeaderUser />
                  </div>
                </div>
              </div>
            ) : loading ? (
              <div className="header__menuUser__loading">
                <div className="loading-spinner"></div>
              </div>
            ) : (
              <div
                className="header__menuUser__myAccount header__menuUser__guest"
                onMouseEnter={(e) =>
                  MouseEnter(
                    e.currentTarget,
                    headerRef.current.getBoundingClientRect(),
                    "right",
                    30
                  )
                }
                onMouseLeave={(e) => {
                  MouseOut(e.currentTarget);
                }}
              >
                <div className="guest-trigger">
                  <MdAccountBox />
                  <span>Tài khoản</span>
                  <MdArrowDropDown />
                </div>
                <div className="dropdown">
                  <HeaderUser />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
