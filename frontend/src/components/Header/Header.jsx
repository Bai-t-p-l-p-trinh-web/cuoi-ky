import {Link} from "react-router-dom";
import { FaPhoneAlt, FaCar } from "react-icons/fa";
import { MdArrowDropDown, MdAccountBox  } from "react-icons/md";
import "./Header.scss";

function Header(){
    return (
        <>
            <header className="header">
                <div className="header__containner container">
                    <div className="header__menuPage">
                        <div className="header__menuPage__logo">
                            <Link to="/">
                                <img src="/header__logo.png" alt="logo"/>
                            </Link>
                        </div>
                        <ul className="header__menuPage__list">
                            <li className="header__menuPage__list-item">
                                <Link to="/">Mua xe</Link>
                            </li>
                            <li className="header__menuPage__list-item">
                                <Link to="/">Bán xe</Link>
                            </li>
                            <li className="header__menuPage__list-item">
                                <Link to="/">Giới thiệu</Link>
                            </li>
                            <li className="header__menuPage__list-item">
                                <Link to="/">Tin tức</Link>
                            </li>
                            <li className="header__menuPage__list-item">
                                <Link to="/">Vay mua xe</Link>
                            </li>
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
                        <div className="header__menuUser__myAccount">
                            <span>
                                <MdAccountBox/>
                                <span>Tài khoản</span>
                            </span>
                            <MdArrowDropDown/>
                        </div>
                    </div>
                </div>

            </header>
            
        </>
    )
};

export default Header;