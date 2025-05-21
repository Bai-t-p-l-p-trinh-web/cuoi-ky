import { Link } from "react-router-dom";
import {Swiper, SwiperSlide} from "swiper/react";
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
function HomeSwiper(){
    const listSwiper = [
        {
            alt: "Xe gia đình",
            img: "https://www.carmudi.vn/_next/image/?url=%2Fimages%2Flisting%2Fcard_discount1.webp&w=750&q=75",
            link: "/1"  
        },
        {
            alt: "Xe kinh doanh",
            img: "https://www.carmudi.vn/_next/image/?url=%2Fimages%2Flisting%2Fcard_discount4.webp&w=750&q=75",
            link: "/1" 
        },
        {
            alt: "Xe nữ",
            img: "https://www.carmudi.vn/_next/image/?url=%2Fimages%2Flisting%2Fcard_discount3.webp&w=750&q=75",
            link: "/1" 
        },
        {
            alt: "Kiểm định xe",
            img: "https://www.carmudi.vn/_next/image/?url=%2Fimages%2Flisting%2Fcard_discount5.webp&w=750&q=75",
            link: "/1" 
        },
        {
            alt: "mua bán xe",
            img: "https://www.carmudi.vn/_next/image/?url=%2Fimages%2Flisting%2Fcard_discount6.webp&w=750&q=75",
            link: "/1" 
        },
    ]
    return (
        <>
            <div className="home__swiper">
                <Swiper className="home__swiper__card"
                    modules={[Navigation]}
                    spaceBetween={160}
                    slidesPerView={4}
                    navigation
                >
                    {
                        listSwiper.length > 0 && 
                        listSwiper.map((card, index) => (
                            <SwiperSlide className="home__swiper__card-item">
                                <Link to={card.link}>
                                    <img src={card.img} alt={card.alt}/>
                                </Link>
                            </SwiperSlide>
                        ))
                    }
                </Swiper>
                
            </div>
        </>
    )
};
export default HomeSwiper;