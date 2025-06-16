import { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import "./scss/OauthFillInfo.scss";

import 'react-toastify/dist/ReactToastify.css';

function OauthFillInfo(){
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name : "",
        email : "",
        password : "",
        rePassword : "",
        phone : "",
        avatar : ""
    });

    useEffect(() => {
        const getTempUser = async () => {
            try {
                const res = await axios.get('http://localhost:3000/api/v1/oauth/tempUser', {
                    withCredentials : true
                });
                setUser(res.data);
                
            } catch (error) {
                toast.error(error.response?.data?.message);
            }

        };
        getTempUser();
    }, []);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setUser((prev) => (
            {
                ...prev,
                [name] : value
            }
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!user.name) {
            toast.error("Tên người dùng không được để trống!");
        }
        if(!user.email) {
            toast.error("Email không được để trống!");
        }
        if(!user.password) {
            toast.error("Mật khẩu không được để trống!");
        }
        if(!user.phone) {
            toast.error("Mật khẩu không được để trống!");
        }
        
        if(user.password !== user.rePassword) {
            toast.error(
                <span>
                    <strong>Mật khẩu xác nhận</strong> phải trùng với <strong>Mật khẩu</strong>
                </span>
            );
            return;
        }

        const { rePassword , ...submitUser} = user;
        
        const loadingToastId = toast.loading("Đang cập nhật...");

        try {
            const updatingUser = await axios.post('http://localhost:3000/api/v1/oauth/updateUser', submitUser,
                {
                    withCredentials : true
                }
            );

            toast.update(loadingToastId, {
                render : updatingUser.data.message || "Cập nhật thông tin người dùng thành công",
                type: "success",
                isLoading : false,
                autoClose : 3000
            });

            navigate("/");
        } catch (error) {
            toast.update(loadingToastId, {
                render: "Cập nhật thông tin thất bại!",
                type: "error",
                isLoading: false,
                autoClose : 3000
            });
        }

    }

    return (
        <>
            <div className="fillInfo">
                <ToastContainer />
                <div className="fillInfo__avatar">
                    <img src={user.avatar || "https://static-00.iconduck.com/assets.00/avatar-default-icon-2048x2048-h6w375ur.png"} alt="avatar" />
                </div>
                <form className="fillInfo__user">
                    <div className="fillInfo__box">
                        <label className="fillInfo__user__name__label" htmlFor="oauth2_name">Tên</label>
                        <input autoComplete="username" required type="text" value={user.name} className="fillInfo__user__name" id="oauth2_name" name="name" onChange={handleChange} />
                    </div>

                    <div className="fillInfo__box">
                        <label className="fillInfo__user__phone__label" htmlFor="oauth2_phone">Số điện thoại</label>
                        <input required type="text" value={user.phone} className="fillInfo__user__phone" id="oauth2_phone" name="phone" onChange={handleChange} />
                    </div>

                    <div className="fillInfo__box">
                        <label className="fillInfo__user__email__label" htmlFor="oauth2_email">Email</label>
                        <input disabled required type="email" value={user.email} className="fillInfo__user__email" id="oauth2_email" name="email" onChange={handleChange} />
                    </div>

                    <div className="fillInfo__box">
                        <label className="fillInfo__user__password__label" htmlFor="oauth2_password">Mật khẩu</label>
                        <input autoComplete="new-password" required type="password" value={user.password} className="fillInfo__user__password" id="oauth2_password" name="password" onChange={handleChange} />
                    </div>

                    <div className="fillInfo__box">
                        <label className="fillInfo__user__rePassword__label" htmlFor="oauth2_rePassword">Xác nhận mật khẩu</label>
                        <input autoComplete="new-password" required type="password" value={user.rePassword} className="fillInfo__user__rePassword" id="oauth2_rePassword" name="rePassword" onChange={handleChange} />
                    </div>

                    <div className="fillInfo__box">
                        <button type="button" className="fillInfo__user__button" onClick={handleSubmit}>Xác nhận</button>
                    </div>
                </form>
            </div>
        </>
    );
};
export default OauthFillInfo;
