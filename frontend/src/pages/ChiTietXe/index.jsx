import { convertCurrency, convertNum } from "../../utils/ConvertNumber";
import { CiCalendar, CiLocationOn } from "react-icons/ci";
import { LuFuel } from "react-icons/lu";
import { FaRoad, FaPhoneAlt  } from "react-icons/fa";
import { RxAvatar } from "react-icons/rx";
import { FaRegComment } from "react-icons/fa6";
import { MdEventSeat } from "react-icons/md";
import SwiperDetail from "../../components/Swiper/CustomSwiper/Swiper_Detail";
import "./scss/ChiTietXe.scss";

function ChiTietXe(){
    const xe = {
        title: "Vinfast Lux A2.0 Plus",
        year: 2020,
        km: 60000,
        fuel: "Xăng",
        seat_capacity: 4,
        price: 535,
        slug: "vinfast-lux-a20-plus",
        location: {
            query_location: "HaNoi+DongAnh",
            query_name: "Hà Nội - Đông Anh"
        },
        img_src: [
            "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066712%2Fconversions%2F68070f3623486_5DCCD97C-2F08-4241-A87F-E2454C3EAD39-636_424.jpg&w=1200&q=75",
            "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066713%2Fconversions%2F68070f3d68436_C8628312-F226-4E45-9533-2ABFE8C862AC-636_424.jpg&w=1200&q=75",
            "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066714%2Fconversions%2F68070f4ded3e2_75324F1A-044C-4888-AC75-6D219A9C4E50-636_424.jpg&w=1200&q=75",
            "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066715%2Fconversions%2F68070f5e6ed0e_FC16B92D-F1F7-4A1D-ABD3-A55CFD97A20E-636_424.jpg&w=1200&q=75",
            "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066716%2Fconversions%2F68070f6e79b14_28FE868F-2E93-4B1E-9FF0-AE4E1C450D1F-636_424.jpg&w=1200&q=75",
            "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066717%2Fconversions%2F68070f762ce7b_9570E8C0-67A8-4B61-B8DF-0ACD695A64BC-636_424.jpg&w=1200&q=75",
            "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066718%2Fconversions%2F68070f7dde300_9FA4BD31-CD9E-43C4-AED7-096802F1BCAE-636_424.jpg&w=1200&q=75",
            "https://www.carmudi.vn/_next/image/?url=https%3A%2F%2Fstatic.carmudi.vn%2Fcarmudi_v3%2Fstorage%2F1066719%2Fconversions%2F68070f8e3c209_47995784-A3EF-43B8-9EAA-5ADF91C46455-636_424.jpg&w=1200&q=75"
        ],
        user: {
            name: "Hùng Quý Auto",
            phone: "0123456789",
            email: "banxe@gmail.com"
        },
        comment:
`Salon Ô Tô Dương Bình Phước chuyên xe cũ, xe lướt. 
Everest đời 2019, bản Titanium. Odo: 66 nghìn km. Giá: 535 triệu (bao rút hồ sơ gốc). 
CAM KẾT: 
    •Máy móc nguyên Zin. 
    •KHÔNG đâm đụng, KHÔNG ngập nước. 
    •Giấy tờ pháp lý hợp lệ, KHÔNG tranh chấp. 
    •Bảo hành máy móc 12 tháng. Siêu Thị Ôtô Bình Phước (Dương Bình Phước). 
Sđt: 0123 456 789 (Dương Tiễn). 
Địa chỉ: 97 Man Thiện, Phường Hiệp Phú, TP Thủ Đức, TP HCM.
`
    }
    return (
        <>
            <div className="chitiet">
                <div className="container">
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
                                <button className="chitiet__xe__buttons__mess">
                                    <FaRegComment className="chitiet__xe__buttons__mess-icon"/>
                                    <span className="chitiet__xe__buttons__mess-span">Nhắn người bán</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};
export default ChiTietXe;