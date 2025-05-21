import {Swiper, SwiperSlide} from "swiper/react";
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';

function SwiperBanXe(){
    const list = [
        {
            name: "Anh Chí Quang",
            img: "https://img.freepik.com/free-vector/funny-serious-cat-animal-meme_23-2148974916.jpg?w=740",
            comment: "Trải nghiệm tuyệt vời",
            detail: "Chợ tốt xe trả giá cao nhất nên mình chọn bán cho bên này. Mình được chủ động thời gian, không mất công di chuyển qua lại nhiều nơi và khi chốt mình nhận thanh toán ngay trong ngày. Rất nhanh gọn!"
        },
        {
            name: "Anh Nhật Lâm",
            img: "https://media.istockphoto.com/id/1325727757/photo/serious-funny-white-fold-cat-with-painted-black-eyebrows.jpg?s=612x612&w=0&k=20&c=_lxDK3xrun-VAg1hlV9qoHv1TmI2BhBwSNjlmvHvs2U=",
            comment: "Nhân viên rất nhiệt tình",
            detail: "Thật khó để tìm được chiếc xe máy móc và nội thất ưng ý, nhưng sau đó tôi tình cờ biết đến chợ tốt xe. Họ có đội ngũ kiểm tra xe tại nhà, hoàn thành các thủ tục giấy tờ nhanh. Thái độ nhân viên tốt."
        },
        {
            name: "Anh Hữu Rú",
            img: "https://ih1.redbubble.net/image.4789831581.5724/flat,750x,075,f-pad,750x1000,f8f8f8.jpg",
            comment: "Quy trình đơn giản và nhanh chóng",
            detail: "Mình đăng ký thử kiểm định miễn phí bên chợ tốt xe thấy nhân viên tới tận nhà kiểm tra nhiệt tình, giá mua kèm bảng kết quả kiểm định rõ ràng, chốt giá là lo hết phần giấy tờ cho mình"
        },
        {
            name: "Anh Thành Trịnh",
            img: "https://scontent.fsgn8-3.fna.fbcdn.net/v/t39.30808-1/434724360_1466054690690956_15223325139732471_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=111&ccb=1-7&_nc_sid=e99d92&_nc_eui2=AeG8JXexhGUB_RoFDwT0luWtgyfQUQeDqgGDJ9BRB4OqAdGsNivGgghCXyvCjraZQ2tC9dBPFf1lk7H-JzT1v5nv&_nc_ohc=E9mqxpZlim0Q7kNvwG7wQOl&_nc_oc=AdkEXX9foVjuw2fDw_bLfLCtDmXyu0o26KyRhLzucfED7MDH4OpQTkDOutIDFOnM1Uo&_nc_zt=24&_nc_ht=scontent.fsgn8-3.fna&_nc_gid=YvL_7tzQ8GMDMLCqCkQBCQ&oh=00_AfL9OsxLGvYuIoygIrl2lRjH1CGurE3ei0l-OnQ4OMAmig&oe=6827694E",
            comment: "Chu đáo và minh bạch",
            detail: "Tôi có gửi thông tin cần bán xe nhiều bên nhưng sau quá trình làm việc, Tôi đánh giá chợ tốt xe có nhân viên hỗ trợ nhanh, chuyên nghiệp, minh bạch và nhất là báo giá tốt so với các bên khác"
        },
    ];
    return (
        <>
            <div className="banxe__trainghiem">
                <h3 className="banxe__trainghiem__title">Chợ tốt xe tự hào hỗ trợ thành công rất nhiều chủ xe</h3>
                <Swiper className="banxe__trainghiem__swiper"
                    spaceBetween={80}
                    slidesPerView={2}
                    modules={[Pagination]}
                    pagination={{ clickable: true }}
                >
                    {
                        list.length > 0 
                        && 
                        list.map((item, index) => (
                            <SwiperSlide className="banxe__trainghiem__danhgia" key={index}>
                                <div className="banxe__trainghiem__danhgia__comment">
                                    <img className="banxe__trainghiem__danhgia__quote" src="/testimonial.svg"/>
                                    <h3 className="banxe__trainghiem__danhgia__comment__title">{item.comment}</h3>
                                    <p className="banxe__trainghiem__danhgia__comment__detail">{item.detail}</p>
                                </div>
                                <div className="banxe__trainghiem__danhgia__user">
                                    <div className="banxe__trainghiem__danhgia__user__image">
                                        <img className="banxe__trainghiem__danhgia__user__image-img" src={item.img} alt={item.name}/>
                                    </div>
                                    <p className="banxe__trainghiem__danhgia__user__name">{item.name}</p>
                                </div>
                            </SwiperSlide>
                        ))
                    }
                </Swiper>
            </div>
        </>
    )
};
export default SwiperBanXe;