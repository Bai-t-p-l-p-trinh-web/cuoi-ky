import { FaCity, FaRoad, FaRegUserCircle  } from "react-icons/fa";
import { CiLocationOn, CiBitcoin  } from "react-icons/ci";
import { MdOutlineDateRange } from "react-icons/md";
import { BsFuelPump, BsTypeStrikethrough } from "react-icons/bs";
import { PiArmchairBold } from "react-icons/pi";
import LocationEnum from "../../constants/locationEnum";
import "./scss/Filter.scss";
// import Filter_1 from "./Filter_1";
import Filter_2 from "./Filter_2";
import Filter_3 from "./Filter_3";

function Filter(props){
    const { ReloadAllPage } = props;
    const getTypeLocation = () => {
        const result = [];
        for (const [key, value] of Object.entries(LocationEnum)) {
            result.push({
                type_query : value.query_location,
                type_name : value.query_name
            });
        };
        return result;
    }

    const filter2_list = {
        title: "ĐỊA ĐIỂM",
        search_holder: "Tìm kiếm theo địa điểm",
        icon: <CiLocationOn/>,
        Types: getTypeLocation(),
        query_name : "location"
    };
    const filter3_list = {
        title: "GIÁ",
        icon: <CiBitcoin/>,
        defaultMin: 1,
        defaultMax: 2000,
        gapMin_Max: 50,
        unit: "Triệu",
        query_name: "price"
    };
    const filter4_list = {
        title: "NĂM SẢN XUẤT",
        icon: <MdOutlineDateRange/>,
        defaultMin: 2000,
        defaultMax: 2025,
        gapMin_Max: 0,
        unit: "Năm",
        query_name: "year"
    };
    const filter5_list = {
        title: "SỐ KM",
        icon: <FaRoad/>,
        defaultMin: 0,
        defaultMax: 200000,
        gapMin_Max: 1000,
        unit: "Km",
        query_name: "km"
    };
    const filter6_list = {
        title: "NHIÊN LIỆU",
        icon: <BsFuelPump/>,
        Types: [
            {
                type_query: "gasoline",
                type_name: "Xăng"
            },
            {
                type_query: "oil",
                type_name: "Dầu"
            },
            {
                type_query: "electric",
                type_name: "Điện"
            }
        ],
        query_name: "fuel_type"
    };
    const filter7_list = {
        title: "SỐ CHỖ NGỒI",
        icon: <PiArmchairBold/>,
        Types: [
            {
                type_query: "2",
                type_name: "2"
            },
            {
                type_query: "3",
                type_name: "3"
            },
            {
                type_query: "4",
                type_name: "4"
            },
            {
                type_query: "5",
                type_name: "5"
            },
            {
                type_query: "6",
                type_name: "6"
            },
            {
                type_query: "7",
                type_name: "7"
            },
            {
                type_query: "8",
                type_name: "8"
            },
            {
                type_query: "9",
                type_name: "9"
            },
        ],
        query_name: "seat_capacity"
    };
    
    return (
        <>
            <div className="home__content__filters">
                <h2 className="home__content__filters-title">BỘ LỌC</h2>
                <Filter_3 data={filter2_list} ReloadAllPage={ReloadAllPage}/>
                <Filter_2 data={filter3_list} ReloadAllPage={ReloadAllPage}/>
                <Filter_2 data={filter4_list} ReloadAllPage={ReloadAllPage}/>
                <Filter_2 data={filter5_list} ReloadAllPage={ReloadAllPage}/>
                <Filter_3 data={filter6_list} ReloadAllPage={ReloadAllPage}/>
                <Filter_3 data={filter7_list} ReloadAllPage={ReloadAllPage}/>
            </div>
        </>
    )
};
export default Filter;