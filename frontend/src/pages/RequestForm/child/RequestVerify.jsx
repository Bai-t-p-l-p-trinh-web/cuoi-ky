import { useNavigate, useOutletContext } from "react-router-dom";
import { CiLocationOn } from "react-icons/ci";
import { MdEmojiPeople, MdOutlineAttachMoney } from "react-icons/md";
import { FaLongArrowAltRight } from "react-icons/fa";
import "../scss/RequestVerify.scss";
import { convertCurrency } from "../../../utils/ConvertNumber";
import { useState } from "react";
import { toast } from "react-toastify";
import apiClient from "../../../utils/axiosConfig";

function RequestVerify() {
  const navigate = useNavigate();
  const { request } = useOutletContext();
  const [postFormInfo, setPostFormInfo] = useState({
    price: 0,
    comment: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPostFormInfo((prev) => ({
      ...postFormInfo,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!postFormInfo.price) {
      toast.error("Bạn cần nhập giá trước khi đăng bán!");
      return;
    }

    if (!postFormInfo.comment) {
      toast.error("Bạn cần nhập mô tả trước khi đăng bán!");
      return;
    }
    const postingCar = toast.loading("Đang truyền yêu cầu đăng bán!");

    // console.log(request);
    try {
      const responsePosting = await apiClient.patch(
        `/requestAdd/${request.slug}/done`,
        postFormInfo
      );
      toast.update(postingCar, {
        render: "Đăng bán thành công!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      setTimeout(() => {
        navigate("/my_account/manage-car");
      }, 3000);
    } catch (error) {
      toast.update(postingCar, {
        render: error.response?.data?.message || "Lỗi khi yêu cầu đăng bán",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };
  return (
    <>
      <div className="requestVerify">
        {/* <ToastContainer/> */}
        <div className="requestVerify__contain">
          <div className="requestVerify__location">
            <span>
              <CiLocationOn /> Địa điểm kiểm tra :{" "}
              <b>{request.location || "..."}</b>
            </span>
          </div>
          {!request.staffs ? (
            <>
              <div className="requestVerify__pending">
                Đang trong quá trình chọn nhân viên kiểm tra ...{" "}
              </div>
            </>
          ) : (
            <>
              <h3 className="requestVerify__employee">
                {" "}
                <MdEmojiPeople /> Nhân viên kiểm tra :{" "}
              </h3>
              <ul className="requestVerify__list">
                {request.staffs.map((staff, r_index) => (
                  <li key={r_index} className="requestVerify__item">
                    <div className="requestVerify__item__image__contain">
                      <img
                        className="requestVerify__item__image"
                        src={
                          staff.avatar ||
                          "https://cdn1.iconfinder.com/data/icons/user-pictures/100/unknown-512.png"
                        }
                        alt={staff.name}
                      />
                    </div>

                    <div className="requestVerify__item__info">
                      <div className="requestVerify__item__info__name">
                        Họ và tên : <b>{staff.name}</b>
                      </div>
                      <div className="requestVerify__item__info__email">
                        Email : <b>{staff.email}</b>
                      </div>
                      <div className="requestVerify__item__info__phone">
                        Số điện thoại : <b>{staff.phone}</b>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {request.status === "pending" && (
                <div className="requestVerify__pending">
                  Nhân viên đang trên đường tới kiểm tra xe bạn
                </div>
              )}
              {(request.status === "checked" || request.status === "done") && (
                <div className="requestVerify__checked">
                  <h3 className="requestVerify__checked__title">
                    Ảnh kiểm tra :{" "}
                  </h3>
                  <div className="requestVerify__checked__images">
                    {request?.img_src?.map((imageUrl, i_index) => (
                      <div
                        key={i_index}
                        className="requestVerify__checked__image__contain"
                      >
                        <img src={imageUrl} alt="image" />
                      </div>
                    ))}
                  </div>
                  <h3 className="requestVerify__checked__price">
                    Giá khuyến nghị :{" "}
                  </h3>
                  <div className="requestVerify__checked__prices">
                    <span className="requestVerify__checked__priceLow">
                      <b>{convertCurrency(request.price_recommend_low)}</b>
                    </span>
                    <span className="requestVerify__checked__horizontal">
                      <FaLongArrowAltRight />
                    </span>
                    <span className="requestVerify__checked__priceHigh">
                      <b>{convertCurrency(request.price_recommend_high)}</b>
                    </span>
                  </div>
                  {request.status === "checked" && (
                    <>
                      <form className="requestVerify__checked__form">
                        <div className="requestVerify__checked__form__box">
                          <label
                            className="requestVerify__check__form__label"
                            htmlFor="rqV_price"
                          >
                            Giá - triệu
                          </label>
                          <input
                            type="number"
                            className="requestVerify__check__form__input"
                            id="rqV_price"
                            name="price"
                            value={postFormInfo.price}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="requestVerify__checked__form__box">
                          <label
                            className="requestVerify__check__form__label"
                            htmlFor="rqV_comment"
                          >
                            Mô tả
                          </label>
                          <textarea
                            type="text"
                            className="requestVerify__check__form__input"
                            id="rqV_comment"
                            name="comment"
                            value={postFormInfo.comment}
                            onChange={handleChange}
                            rows={5}
                          ></textarea>
                        </div>
                      </form>
                      <div className="requestVerify__checked__buttons">
                        <button
                          className="requestVerify__checked__submit"
                          onClick={handleSubmit}
                        >
                          <MdOutlineAttachMoney /> Xác nhận bán
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
              {request.status === "reject" && (
                <div className="requestVerify__rejected">
                  <span className="requestVerify__rejected__title">
                    <b>Yêu cầu của bạn đã bị từ chối : </b>
                  </span>
                  <span className="requestVerify__rejected__message">
                    {request.message}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
export default RequestVerify;
