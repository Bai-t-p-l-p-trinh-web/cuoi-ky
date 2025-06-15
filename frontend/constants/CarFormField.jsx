import { FaGasPump } from "react-icons/fa";
import { MdOilBarrel, MdElectricCar  } from "react-icons/md";

import { IoCarSport, IoCarSportOutline  } from "react-icons/io5";
import { BsCarFrontFill } from "react-icons/bs";
import { FaCaravan } from "react-icons/fa";
import { AiFillCar } from "react-icons/ai";
import { TbCarSuv } from "react-icons/tb";

export const CAR_FORM_FIELDS = [
    {
        fuel_type : "gasoline",
        fuel_name : "Xăng",
        fuel_icon : <FaGasPump/>
    },
    {
        fuel_type : "oil",
        fuel_name : "Dầu",
        fuel_icon : <MdOilBarrel/>
    }, 
    {
        fuel_type : "electric",
        fuel_name : "Điện",
        fuel_icon : <MdElectricCar/>
    }
];

export const CAR_FROM_SEAT = [
    {
        seat_capacity : 2,
        seat_icon : <IoCarSport/>
    },
    {
        seat_capacity : 3,
        seat_icon : <IoCarSportOutline/>
    },
    {
        seat_capacity : 4,
        seat_icon : <BsCarFrontFill/>
    },
    {
        seat_capacity : 5,
        seat_icon : <FaCaravan/>
    },
    {
        seat_capacity : 6,
        seat_icon : <AiFillCar/>
    },
    {
        seat_capacity : 7,
        seat_icon : <TbCarSuv/>
    }
];

export const FUEL_TO_NAME = {
    gasoline : "Xăng",
    oil : "Dầu",
    electric : "Điện"
}