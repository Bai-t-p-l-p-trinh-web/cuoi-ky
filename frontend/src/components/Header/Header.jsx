import {Link} from "react-router-dom";
import { FaPhoneAlt, FaCar, FaAngleDown  } from "react-icons/fa";
import { MdArrowDropDown, MdAccountBox  } from "react-icons/md";
import "./Header.scss";
import { MouseEnter, MouseOut } from "../../utils/Dropdown";
import { useRef } from "react";
import HeaderMuaXe from "./HeaderMuaXe";
import Dropdown from "../Dropdown";
import HeaderUser from "./HeaderUser";

function Header(){
    const headerRef = useRef(null);

    return (
        <>
            <header className="header" ref={headerRef}>
                <div className="header__containner container">
                    <div className="header__menuPage">
                        <div className="header__menuPage__logo">
                            <Link to="/">
                                <img src="/header__logo.png" alt="logo"/>
                            </Link>
                        </div>
                        <ul className="header__menuPage__list">
                            <li className="header__menuPage__list-item" onMouseEnter={(e) => MouseEnter(e.currentTarget, headerRef.current.getBoundingClientRect(), 'left', 20)} onMouseLeave={(e) => {MouseOut(e.currentTarget)}}>
                                <Link to="/">
                                    Mua xe
                                    <span><FaAngleDown/></span>
                                </Link>
                                <div className="dropdown">
                                    <HeaderMuaXe/>
                                </div>
                            </li>
                            <li className="header__menuPage__list-item">
                                <Link to="/ban-xe">Bán xe</Link>
                            </li>
                            <li className="header__menuPage__list-item">
                                <Link to="/gioi-thieu">Giới thiệu</Link>
                            </li>
                            <li className="header__menuPage__list-item">
                                <Link to="/blog-xe-hoi">Tin tức</Link>
                            </li>
                            <Dropdown/>
                        </ul>
                    </div>
                    <div className="header__menuUser">
                        <div className="header__menuUser__post">
                            <Link to="/">
                                <FaCar/>
                                <span>ĐĂNG TIN</span>
                            </Link>
                        </div>
                        <div className="header__menuUser__contact">
                            <FaPhoneAlt/>
                            <span>0123456789</span>
                        </div>
                        <div className="header__menuUser__myAccount" onMouseEnter={(e) => MouseEnter(e.currentTarget, headerRef.current.getBoundingClientRect(), 'left', 30)} onMouseLeave={(e) => {MouseOut(e.currentTarget)}}>
                            <span>
                                <MdAccountBox/>
                                <span>Tài khoản</span>
                            </span>
                            <MdArrowDropDown/>
                            <div className="dropdown">
                                <HeaderUser/>
                            </div>
                        </div>
                    </div>
                </div>

            </header>
            
        </>
    )
};

export default Header;