import { useEffect, useState, useRef } from "react";
import { HiUsers } from "react-icons/hi2";
import { CiLink } from "react-icons/ci";
import { getDate } from "../../../utils/formatDate";
import { Link } from "react-router-dom";
import "../scss/DashBoard.scss";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import UploadButton from "../../../components/UploadButton";
import { Cloudinary } from "@cloudinary/url-gen";

 
function DashBoard() {

    const [profile, setProfile] = useState({
        name : "",
        role : "user",
        email : "",
        phone : "",
        avatar : "",
        createdAt : "",
        contactFacebook : "",
        contactZalo : "",
        contactEmail : "",
        contactLinkedin : "",
    });

    const [changePassword, setChangePassword] = useState({
        oldPassword : "",
        newPassword : ""
    });
    
    // cloudinary 

    const [uploadImage, setUploadImage] = useState("");

    const cloudName = import.meta.env.VITE_CLOUDINARY_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const cld = new Cloudinary({
        cloud : {
            cloudName
        }
    });

    const uwConfig = {
        cloudName,
        uploadPreset,
        cropping: true, 
        croppingAspectRatio: 1,
        multiple: false,
        sources: ['local', 'url', 'camera']
    };

    // end cloudinary 

    const constProfile = useRef(null); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => {
            return {
                ...prev,
                [name] : value
            };
        });
    };

    const handleChangePassword = (e) => {
        const { name, value } = e.target;
        setChangePassword((prev) => {
            return {
                ...prev,
                [name] : value
            };
        });
    };

    const hasChangeInfo = () => {
        if(!constProfile.current) return false;

        if(
            (profile.name !== constProfile.current.name) || 
            (profile.contactFacebook !== constProfile.current.contactFacebook) || 
            (profile.contactZalo !== constProfile.current.contactZalo) || 
            (profile.contactEmail !== constProfile.current.contactEmail) || 
            (profile.contactLinkedin !== constProfile.current.contactLinkedin) || 
            (uploadImage) ||
            (changePassword.oldPassword && changePassword.newPassword)
        ) {
            return true;
        } else {
            return false;
        }
    }

    const handleDeleteImg = () => {
        setUploadImage("");
    };

    useEffect(() => {
        const getInfoMe = async () => {
            try {
                const RespondInfoOfMe = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/v1/user/me`, {
                    withCredentials : true
                });
                
                const user = RespondInfoOfMe.data;
                setProfile((prev) => {
                    if(!user.contactFacebook) {
                        user.contactFacebook = "";
                    }
                    if(!user.contactEmail) {
                        user.contactEmail = "";
                    }
                    if(!user.contactZalo) {
                        user.contactZalo = "";
                    }
                    if(!user.contactLinkedin){
                        user.contactLinkedin = "";
                    }

                    constProfile.current = { ...user };
                    
                    return user;
                });
            } catch(error) {
                toast.error(error.response?.data?.message || 'Lỗi khi lấy thông tin user');
            }
        };
        getInfoMe();
    }, []);

    const requestUpdate = (e) => {
        e.target.disabled = true;

        if(!profile.name) {
            e.target.disabled = false;
            toast.error('Tên người dùng không được để trống!');
            return;
        }

        const isLoadingUpdate = toast.loading('Đang cập nhật thông tin');

        const updatedInfo = {

        };

        if(profile.name !== constProfile.current.name) {
            updatedInfo.name = profile.name;
        }

        if(uploadImage !== constProfile.current.avatar) {
            updatedInfo.avatar = uploadImage;
        }

        if(profile.contactEmail !== constProfile.current.contactEmail) {
            updatedInfo.contactEmail = profile.contactEmail;
        }

        if(profile.contactFacebook !== constProfile.current.contactFacebook) {
            updatedInfo.contactFacebook = profile.contactFacebook;
        }

        if(profile.contactLinkedin !== constProfile.current.contactLinkedin) {
            updatedInfo.contactLinkedin = profile.contactLinkedin;
        }

        if(profile.contactZalo !== constProfile.current.contactZalo) {
            updatedInfo.contactZalo = profile.contactZalo;
        }

        if(changePassword.oldPassword && changePassword.newPassword) {
            updatedInfo.oldPassword = changePassword.oldPassword;
            updatedInfo.newPassword = changePassword.newPassword;
        }

        const updatingUser = async() => {
            try {
                const respondUpdateUser = await axios.patch(`${import.meta.env.VITE_SERVER_URL}/api/v1/user/me`, updatedInfo, {
                    withCredentials : true
                });
                toast.update(isLoadingUpdate, {
                    render : 'Cập nhật thông tin người dùng thành công!',
                    type : 'success',
                    isLoading : false,
                    autoClose : 3000
                });
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            } catch (error) {
                toast.update(isLoadingUpdate, {
                    render : error.response?.data?.message || 'Cập nhật thất bại!',
                    type : 'error',
                    isLoading : false,
                    autoClose : 3000
                });
            }
        };
        updatingUser();
        e.target.disabled = false;
    }

    return (
        <>
            <div className="dashboard">
                <ToastContainer/>
                <div className="dashboard__header">
                    <div className="dashboard__header__title">
                        <div className="dashboard__header__title__contain">
                            <HiUsers/>
                        </div>
                        <span className="dashboard__header__title__span">Users</span>
                    </div>
                </div>
                <div className="dashboard__header__contain">
                    <div className="dashboard__header__settings">
                        <h3 className="dashboard__header__settings__title">Quản lý tài khoản</h3>
                        <div className="dashboard__header__settings__img__contain">
                            <img src={uploadImage || profile.avatar || 'https://greekherald.com.au/wp-content/uploads/2020/07/default-avatar.png'} alt="avatar" />
                            {
                                uploadImage && 
                                <button className="dashboard__header__settings__img__delete" onClick={handleDeleteImg}>
                                    <span>+</span>
                                </button>
                            }
                            
                        </div>
                        
                        <UploadButton cloudName={cloudName} uwConfig={uwConfig} setUploadImage={setUploadImage} />

                        <form className="dashboard__header__settings__form">
                            <div className="dashboard__header__settings__box">
                                <label className="dashboard__header__settings__box__title" htmlFor="ma_oldPassword">Mật khẩu cũ</label>
                                <input type="password" className="dashboard__header__settings__box__input" name="oldPassword" value={changePassword.oldPassword} onChange={handleChangePassword} />
                            </div>

                            <div className="dashboard__header__settings__box">
                                <label className="dashboard__header__settings__box__title" htmlFor="ma_newPassword">Mật khẩu mới</label>
                                <input type="password" className="dashboard__header__settings__box__input" name="newPassword" value={changePassword.newPassword} onChange={handleChangePassword} />
                            </div>
                        </form>

                    </div>

                    <div className="dashboard__profile">
                        <h3 className="dashboard__profile__title">Quản lý thông tin</h3>
                        <form className="dashboard__profile__form">
                            <div className="dashboard__profile__form__box">
                                <label className="dashboard__profile__form__label" htmlFor="ma_name">
                                    Họ và tên
                                </label>
                                <input type="text" name="name" id="ma_name" value={profile.name} className="dashboard__profile__form__input" onChange={handleChange} />
                            </div>

                            <div className="dashboard__profile__form__box">
                                <label className="dashboard__profile__form__label" htmlFor="ma_role">
                                    Vai trò
                                </label>
                                <input disabled type="text" name="role" id="ma_role" value={profile.role == "user" ? "người mua" : (profile.role == "seller" ? "người bán" : "quản trị viên")} className="dashboard__profile__form__input" />
                            </div>

                            <div className="dashboard__profile__form__box">
                                <label className="dashboard__profile__form__label" htmlFor="ma_email">
                                    Email
                                </label>
                                <input disabled type="email" name="email" id="ma_email" value={profile.email} className="dashboard__profile__form__input" />
                            </div>

                            <div className="dashboard__profile__form__box">
                                <label className="dashboard__profile__form__label" htmlFor="ma_phone">
                                    Số điện thoại
                                </label>
                                <input disabled type="text" name="phone" id="ma_phone" value={profile.phone} className="dashboard__profile__form__input" />
                            </div>

                            <div className="dashboard__profile__form__box">
                                <label className="dashboard__profile__form__label" htmlFor="ma_create">
                                    Ngày tạo
                                </label>
                                <input disabled type="text" name="phone" id="ma_create" value={getDate(profile.createdAt)} className="dashboard__profile__form__input" />
                            </div>
                        </form>
                        <h3 className="dashboard__profile__title">Thông tin liên hệ</h3>
                        <form className="dashboard__profile__form">
                            <div className="dashboard__profile__form__box">
                                <label className="dashboard__profile__form__label" htmlFor="ma_contactFacebook">
                                    <span>Facebook</span>
                                    <Link to={profile.contactFacebook} className="dashboard__profile__form__link">
                                        <CiLink/>
                                    </Link>
                                </label>
                                <input type="text" name="contactFacebook" id="ma_contactFacebook" value={profile.contactFacebook} className="dashboard__profile__form__input" onChange={handleChange}/>
                            </div>

                            <div className="dashboard__profile__form__box">
                                <label className="dashboard__profile__form__label" htmlFor="ma_contactZalo">
                                    <span>Zalo</span>
                                    <Link to={`https://zalo.me/${profile.contactZalo}`} className="dashboard__profile__form__link">
                                        <CiLink/>
                                    </Link>
                                </label>
                                <input type="text" name="contactZalo" id="ma_contactZalo" value={profile.contactZalo} className="dashboard__profile__form__input" onChange={handleChange}/>
                            </div>

                            <div className="dashboard__profile__form__box">
                                <label className="dashboard__profile__form__label" htmlFor="ma_contactEmail">
                                    <span>Email</span>
                                    <Link to={`https://mail.google.com/mail/?view=cm&fs=1&to=${profile.contactEmail}`} className="dashboard__profile__form__link">
                                        <CiLink/>
                                    </Link>
                                </label>
                                <input type="email" name="contactEmail" id="ma_contactEmail" value={profile.contactEmail} className="dashboard__profile__form__input" onChange={handleChange}/>
                            </div>

                            <div className="dashboard__profile__form__box">
                                <label className="dashboard__profile__form__label" htmlFor="ma_contactLinkedin">
                                    <span>Linkedin</span>
                                    <Link to={profile.contactLinkedin} className="dashboard__profile__form__link">
                                        <CiLink/>
                                    </Link>
                                </label>
                                <input type="text" name="contactLinkedin" id="ma_contactLinkedin" value={profile.contactLinkedin} className="dashboard__profile__form__input" onChange={handleChange}/>
                            </div>
                        </form>
                        <button 
                            disabled={!hasChangeInfo()} 
                            className="dashboard__profile__button"
                            onClick={requestUpdate}
                        >
                            Xác nhận
                        </button>
                    </div>
                </div>

            </div>
        </>
    )
};
export default DashBoard;