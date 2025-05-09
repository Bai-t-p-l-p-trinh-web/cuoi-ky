import { convertCurrency, convertNum } from "../../../utils/ConvertNumber";
import SwiperCardCar from "../../Swiper/CustomSwiper/Swiper_Card_Car";
import { FaLocationDot } from "react-icons/fa6";
import { FaRoad } from "react-icons/fa";
import { SlCalender } from "react-icons/sl";
import { LuFuel } from "react-icons/lu";
import { PiArmchair } from "react-icons/pi";
function CardCar({item}){
    return (
        <>
        <div className="home__content__main__display__list-item--description">
            <SwiperCardCar img_src={item.img_src}/>
            <h3 className="home__content__main__display__list-item--description-name">{item.title}</h3>
            <div className="home__content__main__display__list-item--description-specific">
                <div className="home__content__main__display__list-item--description-specific--year"><SlCalender/> <span>{item.year}</span> </div>
                <div className="home__content__main__display__list-item--description-specific--km"><FaRoad/> <span>{convertNum(item.km)}</span></div>
                <div className="home__content__main__display__list-item--description-specific--fuel"><LuFuel/> <span>{item.fuel}</span></div>
                <div className="home__content__main__display__list-item--description-specific--seat"><PiArmchair/> <span>{item.seat_capacity}</span></div>
            </div>
            <div className="home__content__main__display__list-item--description-price">{convertCurrency(item.price)}</div>
            <div className="home__content__main__display__list-item--description-location"><FaLocationDot/> <span>{item.location.query_name}</span></div>
        </div>
        </>
    )
};
export default CardCar;