import {Swiper, SwiperSlide} from "swiper/react";
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation, Thumbs } from 'swiper/modules';
import { useState } from "react";

function SwiperDetail({images}){
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    return (
        <>
            <div className="chitiet__xe__display">

                <Swiper 
                    className="chitiet__xe__main__swiper"
                    modules={[Navigation, Thumbs]}
                    spaceBetween={10}
                    slidesPerView={1}
                    navigation
                    thumbs={{swiper: thumbsSwiper}}
                >
                    {
                        images.length > 0
                        && 
                        images.map((image, image_index) => (
                            <SwiperSlide className="chitiet__xe__main__swiper__slide" key={image_index}>
                                <img src={image} alt={`Ảnh ${image_index + 1}`} />
                            </SwiperSlide>
                        ))
                    }
                </Swiper>

                <Swiper 
                    className="chitiet__xe__side__swiper"
                    spaceBetween={20}
                    slidesPerView={5}
                    watchSlidesProgress
                    onSwiper={setThumbsSwiper}
                >
                    {
                        images.length > 0
                        && 
                        images.map((image, image_index) => (
                            <SwiperSlide className="chitiet__xe__side__swiper__slide" key={image_index}>
                                <img src={image} alt={`Ảnh ${image_index + 1}`} />
                            </SwiperSlide>
                        ))
                    }
                </Swiper>
            </div>
        </>
    )
};
export default SwiperDetail;