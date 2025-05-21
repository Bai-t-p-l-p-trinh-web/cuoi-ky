import {Swiper, SwiperSlide} from "swiper/react";
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
function SwiperCardCar({img_src}){
    // console.log(img_src);
    return (
        <>
            <div className="home__content__main__display__list-item--description__swiper">
                <Swiper className="home__content__main__display__list-item--description__swiper__card"
                    modules={[Navigation]}
                    spaceBetween={0}
                    slidesPerView={1}
                    navigation
                >
                    {
                        img_src.length > 0 
                        && 
                        img_src.map((image, image_index) => (
                            <SwiperSlide className="home__content__main__display__list-item--description__swiper__card-item">
                                <img src={image} />
                            </SwiperSlide>
                        ))
                    }
                </Swiper>
            </div>
        </>
    )
};
export default SwiperCardCar;