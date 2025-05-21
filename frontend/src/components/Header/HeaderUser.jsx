import { Link } from "react-router-dom";

function HeaderUser(){
    return (
        <>
            <ul className="header__dropdownUser">
                <li className="header__dropdownUser-item">
                    <Link to="/register">Đăng ký</Link>
                </li>
                <li className="header__dropdownUser-item">
                    <Link to="/login">Đăng nhập</Link>
                </li>
            </ul>
        </>
    )
};

export default HeaderUser;