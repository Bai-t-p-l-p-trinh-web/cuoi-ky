import { useEffect, useState, useRef } from "react";
import { HiUsers } from "react-icons/hi2";
import { CiLink } from "react-icons/ci";
import { getDate } from "../../../utils/formatDate";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser, fetchUser } from "../../../features/auth/authSlice";
import "../scss/DashBoard.scss";
import { ToastContainer, toast } from "react-toastify";
import apiClient from "../../../utils/axiosConfig";
import UploadButton from "../../../components/UploadButton";
import { Cloudinary } from "@cloudinary/url-gen";

function DashBoard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userFromRedux = useSelector((state) => state.auth.user);

  const [profile, setProfile] = useState({
    name: "",
    role: "user",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    avatar: "",
    createdAt: "",
    contactFacebook: "",
    contactZalo: "",
    contactEmail: "",
    contactLinkedin: "",
    isOAuthUser: false,
    hasSetPassword: true,
    is2FAEnabled: false,
  });

  // cloudinary

  const [uploadImage, setUploadImage] = useState("");

  const cloudName = import.meta.env.VITE_CLOUDINARY_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const cld = new Cloudinary({
    cloud: {
      cloudName,
    },
  });

  const uwConfig = {
    cloudName,
    uploadPreset,
    cropping: true,
    croppingAspectRatio: 1,
    multiple: false,
    sources: ["local", "url", "camera"],
  };

  // end cloudinary

  const constProfile = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleChangePassword = (e) => {
    const { name, value } = e.target;
    setChangePassword((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };
  const hasChangeInfo = () => {
    if (!constProfile.current) return false;

    if (
      profile.name !== constProfile.current.name ||
      profile.phone !== constProfile.current.phone ||
      profile.address !== constProfile.current.address ||
      profile.city !== constProfile.current.city ||
      profile.district !== constProfile.current.district ||
      profile.contactFacebook !== constProfile.current.contactFacebook ||
      profile.contactZalo !== constProfile.current.contactZalo ||
      profile.contactEmail !== constProfile.current.contactEmail ||
      profile.contactLinkedin !== constProfile.current.contactLinkedin ||
      uploadImage
    ) {
      return true;
    } else {
      return false;
    }
  };

  const handleDeleteImg = () => {
    setUploadImage("");
  };

  // Hàm toggle 2FA
  const handleToggle2FA = async () => {
    try {
      const response = await apiClient.post("/auth/toggle-2FA", {
        userId: profile.id || profile._id,
      });

      if (response.data.success) {
        setProfile((prev) => ({
          ...prev,
          is2FAEnabled: !prev.is2FAEnabled,
        }));
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Toggle 2FA error:", error);
      toast.error("Có lỗi xảy ra khi thay đổi thiết lập 2FA");
    }
  };

  // Hàm điều hướng tới trang thiết lập mật khẩu cho OAuth users
  const handleSetupPassword = () => {
    navigate("/setup-password");
  };
  useEffect(() => {
    if (userFromRedux) {
      setProfile((prev) => {
        const user = { ...userFromRedux };

        // Set defaults cho các field optional
        if (!user.phone) user.phone = "";
        if (!user.address) user.address = "";
        if (!user.city) user.city = "";
        if (!user.district) user.district = "";
        if (!user.contactFacebook) user.contactFacebook = "";
        if (!user.contactEmail) user.contactEmail = "";
        if (!user.contactZalo) user.contactZalo = "";
        if (!user.contactLinkedin) user.contactLinkedin = "";

        // Ensure boolean fields
        user.isOAuthUser = Boolean(user.isOAuthUser);
        user.hasSetPassword = Boolean(user.hasSetPassword);
        user.is2FAEnabled = Boolean(user.is2FAEnabled);

        constProfile.current = { ...user };
        return user;
      });
    }
  }, [userFromRedux]);
  const requestUpdate = (e) => {
    e.target.disabled = true;

    if (!profile.name) {
      e.target.disabled = false;
      toast.error("Tên người dùng không được để trống!");
      return;
    }

    const isLoadingUpdate = toast.loading("Đang cập nhật thông tin");

    const updatedInfo = {};

    // Kiểm tra các trường đã thay đổi
    if (profile.name !== constProfile.current.name) {
      updatedInfo.name = profile.name;
    }

    if (profile.phone !== constProfile.current.phone) {
      updatedInfo.phone = profile.phone;
    }

    if (profile.address !== constProfile.current.address) {
      updatedInfo.address = profile.address;
    }

    if (profile.city !== constProfile.current.city) {
      updatedInfo.city = profile.city;
    }

    if (profile.district !== constProfile.current.district) {
      updatedInfo.district = profile.district;
    }
    if (uploadImage && uploadImage !== constProfile.current.avatar) {
      updatedInfo.avatar = uploadImage;
    }

    if (profile.contactEmail !== constProfile.current.contactEmail) {
      updatedInfo.contactEmail = profile.contactEmail;
    }

    if (profile.contactFacebook !== constProfile.current.contactFacebook) {
      updatedInfo.contactFacebook = profile.contactFacebook;
    }

    if (profile.contactLinkedin !== constProfile.current.contactLinkedin) {
      updatedInfo.contactLinkedin = profile.contactLinkedin;
    }

    if (profile.contactZalo !== constProfile.current.contactZalo) {
      updatedInfo.contactZalo = profile.contactZalo;
    }

    const updatingUser = async () => {
      try {
        const respondUpdateUser = await apiClient.patch(
          "/user/me",
          updatedInfo
        );
        toast.update(isLoadingUpdate, {
          render: "Cập nhật thông tin người dùng thành công!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        }); // Refetch user data thay vì reload page
        dispatch(fetchUser());
      } catch (error) {
        toast.update(isLoadingUpdate, {
          render: error.response?.data?.message || "Cập nhật thất bại!",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    };
    updatingUser();
    e.target.disabled = false;
  };

  return (
    <>
      <div className="dashboard">
        <ToastContainer />
        <div className="dashboard__header">
          <div className="dashboard__header__title">
            <div className="dashboard__header__title__contain">
              <HiUsers />
            </div>
            <span className="dashboard__header__title__span">Users</span>
          </div>
        </div>
        <div className="dashboard__header__contain">
          <div className="dashboard__header__settings">
            <h3 className="dashboard__header__settings__title">
              Quản lý tài khoản
            </h3>
            <div className="dashboard__header__settings__img__contain">
              <img
                src={
                  uploadImage ||
                  profile.avatar ||
                  "https://greekherald.com.au/wp-content/uploads/2020/07/default-avatar.png"
                }
                alt="avatar"
              />
              {uploadImage && (
                <button
                  className="dashboard__header__settings__img__delete"
                  onClick={handleDeleteImg}
                >
                  <span>+</span>
                </button>
              )}
            </div>

            <UploadButton
              cloudName={cloudName}
              uwConfig={uwConfig}
              setUploadImage={setUploadImage}
            />
          </div>

          {/* Quick Links Section */}
          <div className="dashboard__quick-links">
            <h3 className="dashboard__quick-links__title">Liên kết nhanh</h3>
            <div className="dashboard__quick-links__grid">
              <button
                className="dashboard__quick-links__btn"
                onClick={() => navigate("/transaction-history")}
              >
                <span className="icon">📋</span>
                <span>Lịch sử giao dịch</span>
              </button>
              <button
                className="dashboard__quick-links__btn"
                onClick={() => navigate("/my_account/manage-car")}
              >
                <span className="icon">🚗</span>
                <span>Quản lý xe</span>
              </button>
              <button
                className="dashboard__quick-links__btn"
                onClick={() => navigate("/chat")}
              >
                <span className="icon">💬</span>
                <span>Tin nhắn</span>
              </button>
            </div>
          </div>

          <div className="dashboard__profile">
            <h3 className="dashboard__profile__title">Quản lý thông tin</h3>
            <form className="dashboard__profile__form">
              <div className="dashboard__profile__form__box">
                <label
                  className="dashboard__profile__form__label"
                  htmlFor="ma_name"
                >
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="name"
                  id="ma_name"
                  value={profile.name}
                  className="dashboard__profile__form__input"
                  onChange={handleChange}
                />
              </div>
              <div className="dashboard__profile__form__box">
                <label
                  className="dashboard__profile__form__label"
                  htmlFor="ma_role"
                >
                  Vai trò
                </label>
                <input
                  disabled
                  type="text"
                  name="role"
                  id="ma_role"
                  value={
                    profile.role == "user"
                      ? "người mua"
                      : profile.role == "seller"
                      ? "người bán"
                      : "quản trị viên"
                  }
                  className="dashboard__profile__form__input"
                />
              </div>
              <div className="dashboard__profile__form__box">
                <label
                  className="dashboard__profile__form__label"
                  htmlFor="ma_email"
                >
                  Email
                </label>
                <input
                  disabled
                  type="email"
                  name="email"
                  id="ma_email"
                  value={profile.email}
                  className="dashboard__profile__form__input"
                />
              </div>{" "}
              <div className="dashboard__profile__form__box">
                <label
                  className="dashboard__profile__form__label"
                  htmlFor="ma_phone"
                >
                  Số điện thoại
                </label>
                <input
                  type="text"
                  name="phone"
                  id="ma_phone"
                  value={profile.phone}
                  className="dashboard__profile__form__input"
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div className="dashboard__profile__form__box">
                <label
                  className="dashboard__profile__form__label"
                  htmlFor="ma_address"
                >
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="address"
                  id="ma_address"
                  value={profile.address}
                  className="dashboard__profile__form__input"
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ"
                />
              </div>
              <div className="dashboard__profile__form__box">
                <label
                  className="dashboard__profile__form__label"
                  htmlFor="ma_city"
                >
                  Tỉnh/Thành phố
                </label>
                <input
                  type="text"
                  name="city"
                  id="ma_city"
                  value={profile.city}
                  className="dashboard__profile__form__input"
                  onChange={handleChange}
                  placeholder="Nhập tỉnh/thành phố"
                />
              </div>
              <div className="dashboard__profile__form__box">
                <label
                  className="dashboard__profile__form__label"
                  htmlFor="ma_district"
                >
                  Quận/Huyện
                </label>
                <input
                  type="text"
                  name="district"
                  id="ma_district"
                  value={profile.district}
                  className="dashboard__profile__form__input"
                  onChange={handleChange}
                  placeholder="Nhập quận/huyện"
                />
              </div>{" "}
              <div className="dashboard__profile__form__box">
                <label
                  className="dashboard__profile__form__label"
                  htmlFor="ma_create"
                >
                  Ngày tạo
                </label>
                <input
                  disabled
                  type="text"
                  name="phone"
                  id="ma_create"
                  value={getDate(profile.createdAt)}
                  className="dashboard__profile__form__input"
                />
              </div>
            </form>{" "}
            {/* Section riêng cho Email & Password */}
            <h3 className="dashboard__profile__title">Bảo mật tài khoản</h3>
            <div className="dashboard__security">
              {" "}
              <div className="dashboard__security__item">
                <div className="dashboard__security__info">
                  <label className="dashboard__profile__form__label">
                    Email đăng nhập
                  </label>
                  <div className="dashboard__security__value">
                    {profile.email}
                  </div>
                </div>
                <button
                  className={`dashboard__security__button ${
                    profile.isOAuthUser ? "disabled" : ""
                  }`}
                  onClick={() =>
                    !profile.isOAuthUser && navigate("/change-email")
                  }
                  disabled={profile.isOAuthUser}
                  title={
                    profile.isOAuthUser
                      ? "Không thể đổi email cho tài khoản OAuth"
                      : ""
                  }
                >
                  {profile.isOAuthUser ? "Email cố định" : "Đổi Email"}
                </button>
              </div>
              <div className="dashboard__security__item">
                <div className="dashboard__security__info">
                  <label className="dashboard__profile__form__label">
                    Mật khẩu
                  </label>{" "}
                  <div className="dashboard__security__value">
                    {profile.isOAuthUser && !profile.hasSetPassword
                      ? "Chưa thiết lập"
                      : "••••••••"}
                  </div>
                </div>
                <button
                  className="dashboard__security__button"
                  onClick={() => {
                    if (profile.isOAuthUser && !profile.hasSetPassword) {
                      handleSetupPassword();
                    } else {
                      navigate("/change-password");
                    }
                  }}
                >
                  {profile.isOAuthUser && !profile.hasSetPassword
                    ? "Thiết lập mật khẩu"
                    : "Đổi mật khẩu"}
                </button>
              </div>
              {/* 2FA chỉ cho users đăng nhập thường */}
              {!profile.isOAuthUser && (
                <div className="dashboard__security__item">
                  <div className="dashboard__security__info">
                    <label className="dashboard__profile__form__label">
                      Đăng nhập 2 yếu tố
                    </label>
                    <div className="dashboard__security__value">
                      {profile.is2FAEnabled ? "Đã bật" : "Đã tắt"}
                    </div>
                  </div>
                  <button
                    className={`dashboard__security__button ${
                      profile.is2FAEnabled ? "danger" : "success"
                    }`}
                    onClick={handleToggle2FA}
                  >
                    {profile.is2FAEnabled ? "Tắt 2FA" : "Bật 2FA"}
                  </button>
                </div>
              )}
            </div>
            <h3 className="dashboard__profile__title">Thông tin liên hệ</h3>
            <form className="dashboard__profile__form">
              <div className="dashboard__profile__form__box">
                <label
                  className="dashboard__profile__form__label"
                  htmlFor="ma_contactFacebook"
                >
                  <span>Facebook</span>
                  <Link
                    to={profile.contactFacebook}
                    className="dashboard__profile__form__link"
                  >
                    <CiLink />
                  </Link>
                </label>
                <input
                  type="text"
                  name="contactFacebook"
                  id="ma_contactFacebook"
                  value={profile.contactFacebook}
                  className="dashboard__profile__form__input"
                  onChange={handleChange}
                />
              </div>

              <div className="dashboard__profile__form__box">
                <label
                  className="dashboard__profile__form__label"
                  htmlFor="ma_contactZalo"
                >
                  <span>Zalo</span>
                  <Link
                    to={`https://zalo.me/${profile.contactZalo}`}
                    className="dashboard__profile__form__link"
                  >
                    <CiLink />
                  </Link>
                </label>
                <input
                  type="text"
                  name="contactZalo"
                  id="ma_contactZalo"
                  value={profile.contactZalo}
                  className="dashboard__profile__form__input"
                  onChange={handleChange}
                />
              </div>

              <div className="dashboard__profile__form__box">
                <label
                  className="dashboard__profile__form__label"
                  htmlFor="ma_contactEmail"
                >
                  <span>Email</span>
                  <Link
                    to={`https://mail.google.com/mail/?view=cm&fs=1&to=${profile.contactEmail}`}
                    className="dashboard__profile__form__link"
                  >
                    <CiLink />
                  </Link>
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  id="ma_contactEmail"
                  value={profile.contactEmail}
                  className="dashboard__profile__form__input"
                  onChange={handleChange}
                />
              </div>

              <div className="dashboard__profile__form__box">
                <label
                  className="dashboard__profile__form__label"
                  htmlFor="ma_contactLinkedin"
                >
                  <span>Linkedin</span>
                  <Link
                    to={profile.contactLinkedin}
                    className="dashboard__profile__form__link"
                  >
                    <CiLink />
                  </Link>
                </label>
                <input
                  type="text"
                  name="contactLinkedin"
                  id="ma_contactLinkedin"
                  value={profile.contactLinkedin}
                  className="dashboard__profile__form__input"
                  onChange={handleChange}
                />
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
  );
}
export default DashBoard;
