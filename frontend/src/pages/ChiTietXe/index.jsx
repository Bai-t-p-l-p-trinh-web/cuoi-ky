import { convertCurrency, convertNum } from "../../utils/ConvertNumber";
import { CiCalendar, CiLocationOn } from "react-icons/ci";
import { LuFuel } from "react-icons/lu";
import { FaRoad, FaPhoneAlt  } from "react-icons/fa";
import { RxAvatar } from "react-icons/rx";
import { FaRegComment } from "react-icons/fa6";
import { MdEventSeat } from "react-icons/md";
import SwiperDetail from "../../components/Swiper/CustomSwiper/Swiper_Detail";
import "./scss/ChiTietXe.scss";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

import { useEffect, useState } from "react";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ChiTietXe(){
    const navigate = useNavigate();
    const { slugCar } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [xe, setXe] = useState(null);


    useEffect(() => {
        const getDataCar = async() => {
            try {
                const resDataCar = await axios.get(`http://localhost:3000/api/v1/car/${slugCar}`);
                setXe(resDataCar.data);
            } catch (error) {
                toast.error(error?.response?.data?.message);
            } finally {
                setIsLoading(false);
            }
        }
        if(slugCar) {
            getDataCar();
        }
        
        
    }, [slugCar]);

    const contactSeller = () => {
        const dataSend = {
            sellerId : xe.user.id
        };
        const startMessage = async () => {
            try {
                const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/thread/start`, dataSend, {
                    withCredentials : true
                });
                toast.success('Liên hệ người bán thành công đang điều hướng sang tin nhắn');
                setTimeout(() => {
                    navigate('/chat');
                }, 3000);
            } catch(error) {
                console.log(error);
                toast.error('Liên hệ người bán thất bại');
            }
        };
        startMessage();

    }
    return (
        <>
            <div className="chitiet">
                <ToastContainer />
                <div className="container">
                    {
                        isLoading ? 
                        (
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
                                    <hr className="chitiet__xe__thongso__horizontal"/>
                                    <div className="chitiet__xe__lienhe">
                                    <Skeleton height={25} width={150} />
                                    <Skeleton height={25} width={150} />
                                    </div>
                                    <div className="chitiet__xe__buttons">
                                    <Skeleton height={40} width={120} style={{ marginRight: '10px' }} />
                                    <Skeleton height={40} width={120} />
                                    </div>
                                </div>
                            </div>
                        )
                        : 
                        <>
                            {
                                xe && 
                                <div className="chitiet__xe">
                                    <div className="chitiet__xe__anh">
                                        <SwiperDetail images={xe.img_src}/>
                                        <p className="chitiet__xe__anh__p">Mô tả</p>
                                        <pre className="chitiet__xe__anh__comment">
                                            {xe.comment}
                                        </pre>
                                    </div>
                                    <div className="chitiet__xe__thongso">
                                        <div className="chitiet__xe__thongso--title">{xe.title}</div>
                                        <div className="chitiet__xe__thongso--price">{convertCurrency(xe.price)}</div>
                                        <div className="chitiet__xe__thongso__contain">
                                            <div className="chitiet__xe__thongso--detail">
                                                <CiCalendar className="chitiet__xe__thongso--detail-icon"/>
                                                <span className="chitiet__xe__thongso--detail-type">Năm sản xuất</span>
                                                <span className="chitiet__xe__thongso--detail-value">{xe.year}</span>
                                            </div>
                                            <div className="chitiet__xe__thongso--detail">
                                                <LuFuel className="chitiet__xe__thongso--detail-icon"/>
                                                <span className="chitiet__xe__thongso--detail-type">Nhiên liệu</span>
                                                <span className="chitiet__xe__thongso--detail-value">{xe.fuel}</span>
                                            </div>
                                            <div className="chitiet__xe__thongso--detail">
                                                <FaRoad className="chitiet__xe__thongso--detail-icon"/>
                                                <span className="chitiet__xe__thongso--detail-type">Số KM</span>
                                                <span className="chitiet__xe__thongso--detail-value">{convertNum(xe.km)} km</span>
                                            </div>
                                            <div className="chitiet__xe__thongso--detail">
                                                <MdEventSeat className="chitiet__xe__thongso--detail-icon"/>
                                                <span className="chitiet__xe__thongso--detail-type">Số chỗ ngồi</span>
                                                <span className="chitiet__xe__thongso--detail-value">{xe.seat_capacity}</span>
                                            </div>
                                        </div>
                                        <hr className="chitiet__xe__thongso__horizontal"/>
                                        <div className="chitiet__xe__lienhe">
                                            <div className="chitiet__xe__lienhe--detail">
                                                <CiLocationOn className="chitiet__xe__lienhe--detail-icon"/>
                                                <span className="chitiet__xe__lienhe--detail-type">Địa điểm</span>
                                                <span className="chitiet__xe__lienhe--detail-value">{xe.location.query_name}</span>
                                            </div>
                                            <div className="chitiet__xe__lienhe--detail">
                                                <RxAvatar className="chitiet__xe__lienhe--detail-icon"/>
                                                <span className="chitiet__xe__lienhe--detail-type">Đăng bởi</span>
                                                <span className="chitiet__xe__lienhe--detail-value">{xe.user.name}</span>
                                            </div>
                                        </div>
                                        <div className="chitiet__xe__buttons">
                                            <button className="chitiet__xe__buttons__call">
                                                <FaPhoneAlt className="chitiet__xe__buttons__call-icon"/>
                                                <span className="chitiet__xe__buttons__call-span">Gọi người bán</span>
                                            </button>
                                            <button className="chitiet__xe__buttons__mess" onClick={contactSeller}>
                                                <FaRegComment className="chitiet__xe__buttons__mess-icon"/>
                                                <span className="chitiet__xe__buttons__mess-span">Nhắn người bán</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            }
                        </>
                    }
                    
                </div>
            </div>
        </>
    )
};
export default ChiTietXe;