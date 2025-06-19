import { convertCurrency, convertNum } from "../../utils/ConvertNumber";
import { CiCalendar, CiLocationOn } from "react-icons/ci";
import { LuFuel } from "react-icons/lu";
import { FaRoad, FaPhoneAlt } from "react-icons/fa";
import { RxAvatar } from "react-icons/rx";
import { FaRegComment } from "react-icons/fa6";
import { MdEventSeat } from "react-icons/md";
import { IoCarSport } from "react-icons/io5";
import SwiperDetail from "../../components/Swiper/CustomSwiper/Swiper_Detail";
import CreateOrderForm from "../../components/order/CreateOrderForm";
import "./scss/ChiTietXe.scss";
import { Link, useNavigate, useParams } from "react-router-dom";
import apiClient from "../../utils/axiosConfig";

import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useFetchUserInfo } from "../../hooks/useFetchUserInfo";

function ChiTietXe() {
  const navigate = useNavigate();
  const { slugCar } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [xe, setXe] = useState(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const { user, loading, error } = useFetchUserInfo();
  useEffect(() => {
    const getDataCar = async () => {
      try {
        console.log("get car by slug");
        const resDataCar = await apiClient.get(`/car/${slugCar}`);
        setXe(resDataCar.data);
      } catch (error) {
        toast.error(error?.response?.data?.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (slugCar) {
      getDataCar();
    }
  }, [slugCar]);
  console.log(xe);
  const contactSeller = () => {
    const dataSend = {
      sellerId: xe.user.id,
    };
    const startMessage = async () => {
      try {
        const res = await apiClient.post("/thread/start", dataSend);
        toast.success(
          "Liên hệ người bán thành công đang điều hướng sang tin nhắn"
        );
        setTimeout(() => {
          navigate("/chat");
        }, 3000);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Liên hệ người bán thất bại"
        );
      }
    };
    startMessage();
  };

  const handleBuyCar = () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để mua xe!");
      navigate("/auth");
      return;
    }

    if (xe.user.id === user._id) {
      toast.error("Bạn không thể mua xe của chính mình!");
      return;
    }

    if (xe.status !== "selling") {
      toast.error("Xe này hiện không còn bán!");
      return;
    }

    setShowOrderForm(true);
  };

  const handleOrderSuccess = () => {
    // Reload trang để cập nhật trạng thái xe
    setShowOrderForm(false);
    window.location.reload();
  };

  const copyPhoneToClipboard = () => {
    if (!xe || !xe.user?.phone) {
      toast.error("Không có số điện thoại để sao chép");
      return;
    }

    navigator.clipboard
      .writeText(xe.user.phone)
      .then(() => {
        toast.success("Đã sao chép số điện thoại vào clipboard!");
      })
      .catch(() => {
        toast.error("Không thể sao chép số điện thoại!");
      });
  };

  return (
    <>
      <div className="chitiet">
        <ToastContainer />
        <div className="container">
          {isLoading ? (
            <div className="chitiet__xe">
              <div className="chitiet__xe__anh">
                <Skeleton height={300} />
                <p className="chitiet__xe__anh__p">Mô tả</p>
                <Skeleton count={5} />
              </div>
              <div className="chitiet__xe__thongso">
                <Skeleton height={40} width={200} />
                <Skeleton height={30} width={150} />
                <div className="chitiet__xe__thongso__contain">
                  <Skeleton height={25} width={120} />
                  <Skeleton height={25} width={120} />
                  <Skeleton height={25} width={120} />
                  <Skeleton height={25} width={120} />
                </div>
                <hr className="chitiet__xe__thongso__horizontal" />
                <div className="chitiet__xe__lienhe">
                  <Skeleton height={25} width={150} />
                  <Skeleton height={25} width={150} />
                </div>
                <div className="chitiet__xe__buttons">
                  <Skeleton
                    height={40}
                    width={120}
                    style={{ marginRight: "10px" }}
                  />
                  <Skeleton height={40} width={120} />
                </div>
              </div>
            </div>
          ) : (
            <>
              {xe && (
                <div className="chitiet__xe">
                  <div className="chitiet__xe__anh">
                    <SwiperDetail images={xe.img_src} />
                    <p className="chitiet__xe__anh__p">Mô tả</p>
                    <pre className="chitiet__xe__anh__comment">
                      {xe.comment}
                    </pre>
                  </div>
                  <div className="chitiet__xe__thongso">
                    <div className="chitiet__xe__thongso--title">
                      {xe.title}
                    </div>
                    <div className="chitiet__xe__thongso--price">
                      {convertCurrency(xe.price)}
                    </div>
                    <div className="chitiet__xe__thongso__contain">
                      <div className="chitiet__xe__thongso--detail">
                        <CiCalendar className="chitiet__xe__thongso--detail-icon" />
                        <span className="chitiet__xe__thongso--detail-type">
                          Năm sản xuất
                        </span>
                        <span className="chitiet__xe__thongso--detail-value">
                          {xe.year}
                        </span>
                      </div>
                      <div className="chitiet__xe__thongso--detail">
                        <LuFuel className="chitiet__xe__thongso--detail-icon" />
                        <span className="chitiet__xe__thongso--detail-type">
                          Nhiên liệu
                        </span>
                        <span className="chitiet__xe__thongso--detail-value">
                          {xe.fuel}
                        </span>
                      </div>
                      <div className="chitiet__xe__thongso--detail">
                        <FaRoad className="chitiet__xe__thongso--detail-icon" />
                        <span className="chitiet__xe__thongso--detail-type">
                          Số KM
                        </span>
                        <span className="chitiet__xe__thongso--detail-value">
                          {convertNum(xe.km)} km
                        </span>
                      </div>
                      <div className="chitiet__xe__thongso--detail">
                        <MdEventSeat className="chitiet__xe__thongso--detail-icon" />
                        <span className="chitiet__xe__thongso--detail-type">
                          Số chỗ ngồi
                        </span>
                        <span className="chitiet__xe__thongso--detail-value">
                          {xe.seat_capacity}
                        </span>
                      </div>
                    </div>
                    <hr className="chitiet__xe__thongso__horizontal" />
                    <div className="chitiet__xe__lienhe">
                      <div className="chitiet__xe__lienhe--detail">
                        <CiLocationOn className="chitiet__xe__lienhe--detail-icon" />
                        <span className="chitiet__xe__lienhe--detail-type">
                          Địa điểm
                        </span>
                        <span className="chitiet__xe__lienhe--detail-value">
                          {xe.location.query_name || "Toàn quốc"}
                        </span>
                      </div>
                      <div className="chitiet__xe__lienhe--detail">
                        <RxAvatar className="chitiet__xe__lienhe--detail-icon" />
                        <span className="chitiet__xe__lienhe--detail-type">
                          Đăng bởi
                        </span>
                        <span className="chitiet__xe__lienhe--detail-value">
                          <Link to={`/nguoi-ban/${xe.user.slug}`}>
                            {xe.user.name}
                          </Link>
                        </span>
                      </div>
                    </div>{" "}
                    <div className="chitiet__xe__buttons">
                      {xe.status === "selling" && (
                        <button
                          className="chitiet__xe__buttons__buy"
                          onClick={handleBuyCar}
                        >
                          <IoCarSport className="chitiet__xe__buttons__buy-icon" />
                          <span className="chitiet__xe__buttons__buy-span">
                            Mua xe
                          </span>
                        </button>
                      )}

                      <button
                        className="chitiet__xe__buttons__call"
                        onClick={copyPhoneToClipboard}
                      >
                        <FaPhoneAlt className="chitiet__xe__buttons__call-icon" />
                        <span className="chitiet__xe__buttons__call-span">
                          Gọi người bán
                        </span>
                      </button>
                      <button
                        className="chitiet__xe__buttons__mess"
                        onClick={contactSeller}
                      >
                        <FaRegComment className="chitiet__xe__buttons__mess-icon" />
                        <span className="chitiet__xe__buttons__mess-span">
                          Nhắn người bán
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}{" "}
        </div>
      </div>{" "}
      {/* Order Form Modal */}{" "}
      {showOrderForm && xe && (
        <CreateOrderForm
          car={xe}
          onClose={() => setShowOrderForm(false)}
          onOrderCreated={handleOrderSuccess}
        />
      )}
    </>
  );
}
export default ChiTietXe;
