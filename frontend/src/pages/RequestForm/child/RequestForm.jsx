import { useEffect, useRef, useState } from "react";
import { useFetchUserInfo } from "../../../hooks/useFetchUserInfo";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  TbCircleNumber1,
  TbCircleNumber2,
  TbCircleNumber3,
  TbCircleNumber4,
  TbCircleNumber5,
  TbCircleNumber6,
  TbCircleNumber7,
} from "react-icons/tb";
import {
  CAR_FORM_FIELDS,
  CAR_FROM_SEAT,
} from "../../../../constants/CarFormField";
import { Cloudinary } from "@cloudinary/url-gen/index";
import UploadButton from "../../../components/UploadButton";

import "../scss/RequestForm.scss";
import { isImageUrlOrDefault } from "../../../utils/Status";
import apiClient from "../../../utils/axiosConfig";

function RequestForm() {
  const [formInfo, setFormInfo] = useState({
    name: "",
    year: 0,
    km: "",
    fuel: "",
    seat_capacity: "",
    location: "",
  });

  const navigate = useNavigate();
  const { user, loading, error } = useFetchUserInfo();
  const isLoading = useRef(true);

  useEffect(() => {
    if (!loading && isLoading.current == false && !user) {
      toast.error("Người dùng chưa đăng nhập xin vui lòng đăng nhập");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } else if (
      !loading &&
      isLoading.current == false &&
      user &&
      user.role !== "seller"
    ) {
      toast.error("Người dùng phải đăng ký làm người bán trước");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }
    isLoading.current = false;
  }, [user, loading, isLoading.current]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePick = (name, value) => {
    setFormInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  const handleSubmit = async () => {
    const { name, year, km, fuel, seat_capacity, location } = formInfo;

    if (!name || !name.trim()) {
      toast.error("tên xe không được để trống!");
      return;
    }

    if (!year || year < 1900 || year > new Date().getFullYear()) {
      toast.error("số năm mua không hợp lệ");
      return;
    }

    if (!km || km < 0) {
      toast.error("số km đã đi không hợp lệ");
      return;
    }

    if (!fuel) {
      toast.error("nhiên liệu dùng không được để trống");
      return;
    }

    if (!seat_capacity) {
      toast.error("số chỗ ngồi không được để trống!");
      return;
    }

    if (!location) {
      toast.error("Địa điểm kiểm tra không được để trống");
      return;
    }

    if (!uploadImage) {
      toast.error("Ảnh minh họa không được để trống!");
      return;
    }

    const DataSend = {
      name,
      year,
      km,
      fuel,
      seat_capacity,
      location,
      img_demo: uploadImage,
    };

    const creatingRequest = toast.loading("Đang tạo yêu cầu xét duyệt !");
    try {
      const responseCreateForm = await apiClient.post("/requestAdd", DataSend);

      toast.update(creatingRequest, {
        render: "Tạo yêu cầu thành công",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      setTimeout(() => {
        navigate("/my_account/inspection-history");
      }, 3000);
    } catch (error) {
      console.error("Error creating request:", error);

      // Kiểm tra lỗi cần thông tin ngân hàng
      if (error.response?.data?.needBankInfo) {
        toast.update(creatingRequest, {
          render: "Bạn cần cập nhật thông tin ngân hàng trước khi đăng xe",
          type: "warning",
          isLoading: false,
          autoClose: 5000,
        });

        setTimeout(() => {
          navigate("/my_account/bank-info");
        }, 2000);
      } else {
        toast.update(creatingRequest, {
          render: error.response?.data?.message || "Lỗi khi yêu cầu tạo đơn !",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    }
  };

  return (
    <>
      <div className="requestform">
        <ToastContainer />
        <div className="requestform__progress__contain">
          <ul className="requestform__progress">
            <li className="requestform__progress__current">
              1. Điền thông tin
            </li>
            <li className="requestform__progress__horizontal"></li>
            <li className="requestform__progress__future">2. Đợi xác thực</li>
            <li className="requestform__progress__horizontal"></li>
            <li className="requestform__progress__future">3. Xác thực</li>
          </ul>
        </div>

        <h3 className="requestform__title">Đăng ký bán xe</h3>

        <div className="requestform__notice">
          <div className="notice-card">
            <h4>📋 Lưu ý quan trọng</h4>
            <p>
              Trước khi đăng xe, bạn cần cập nhật thông tin ngân hàng để có thể
              nhận thanh toán từ người mua.
            </p>
            <p>
              <a
                href="/my_account/bank-info"
                target="_blank"
                rel="noopener noreferrer"
              >
                👉 Cập nhật thông tin ngân hàng tại đây
              </a>
            </p>
          </div>
        </div>

        <div className="requestform__contain">
          <div className="requestform__box">
            <h4 className="requestform__question">
              <TbCircleNumber1 className="requestform__question__number" />
              <span className="requestform__question__title">
                Tên phương tiện
              </span>
            </h4>
            <div className="requestform__content">
              <input
                type="text"
                name="name"
                className="requestform__content__input"
                placeholder="Tên phương tiện..."
                id="rq_name"
                value={formInfo.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="requestform__box">
            <h4 className="requestform__question">
              <TbCircleNumber2 className="requestform__question__number" />
              <span className="requestform__question__title">Năm mua xe</span>
            </h4>
            <div className="requestform__content">
              <input
                type="number"
                name="year"
                placeholder="năm mua xe..."
                className="requestform__content__input"
                min="1000"
                max="2025"
                id="rq_year"
                value={formInfo.year}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="requestform__box">
            <h4 className="requestform__question">
              <TbCircleNumber3 className="requestform__question__number" />
              <span className="requestform__question__title">
                Số kilomet đã đi
              </span>
            </h4>
            <div className="requestform__content">
              <input
                type="number"
                name="km"
                placeholder="số km đã đi"
                className="requestform__content__input"
                id="rq_km"
                value={formInfo.km}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="requestform__box">
            <h4 className="requestform__question">
              <TbCircleNumber4 className="requestform__question__number" />
              <span className="requestform__question__title">
                Loại nhiên liệu sử dụng
              </span>
            </h4>
            <div className="requestform__content">
              <ul className="requestform__content__list">
                {CAR_FORM_FIELDS &&
                  CAR_FORM_FIELDS.map((fuel, f_index) => (
                    <li
                      key={f_index}
                      className={
                        "requestform__content__item " +
                        (fuel.fuel_type === formInfo.fuel ? "picked" : "")
                      }
                      onClick={() => {
                        handlePick("fuel", fuel.fuel_type);
                      }}
                    >
                      <div className="requestform__content__item__icon">
                        {fuel.fuel_icon}
                      </div>
                      <span className="requestform__content__item__span">
                        {fuel.fuel_name}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>

          <div className="requestform__box">
            <h4 className="requestform__question">
              <TbCircleNumber5 className="requestform__question__number" />
              <span className="requestform__question__title">Số chỗ ngồi</span>
            </h4>
            <div className="requestform__content">
              <ul className="requestform__content__list">
                {CAR_FROM_SEAT &&
                  CAR_FROM_SEAT.map((seat, s_index) => (
                    <li
                      key={s_index}
                      className={
                        "requestform__content__item " +
                        (seat.seat_capacity === formInfo.seat_capacity
                          ? "picked"
                          : "")
                      }
                      onClick={() => {
                        handlePick("seat_capacity", seat.seat_capacity);
                      }}
                    >
                      <div className="requestform__content__item__icon">
                        {seat.seat_icon}
                      </div>
                      <span className="requestform__content__item__span">
                        {seat.seat_capacity}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>

          <div className="requestform__box">
            <h4 className="requestform__question">
              <TbCircleNumber6 className="requestform__question__number" />
              <span className="requestform__question__title">
                Địa điểm muốn kiểm tra
              </span>
            </h4>
            <div className="requestform__content">
              <input
                type="text"
                placeholder="địa điểm kiểm tra"
                name="location"
                className="requestform__content__input"
                id="rq_location"
                value={formInfo.location}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="requestform__box">
            <h4 className="requestform__question">
              <TbCircleNumber6 className="requestform__question__number" />
              <span className="requestform__question__title">
                Hình ảnh minh họa
              </span>
            </h4>
            <div className="requestform__content">
              {!uploadImage ? (
                <>
                  <UploadButton
                    cloudName={cloudName}
                    uwConfig={uwConfig}
                    setUploadImage={setUploadImage}
                  />
                </>
              ) : (
                <>
                  <div className="requestform__uploadedImage">
                    <button
                      className="requestform__uploadedImage__button"
                      onClick={() => {
                        setUploadImage("");
                      }}
                    >
                      x
                    </button>
                    <img
                      className="requestform__uploadedImage__image"
                      src={isImageUrlOrDefault(uploadImage)}
                      alt="imagePreview"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="requestform__submit">
            <button
              className="requestform__submit__button"
              onClick={handleSubmit}
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
export default RequestForm;
