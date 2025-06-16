import { Link, useLocation, useSearchParams } from "react-router-dom";
import { convertNum } from "../../utils/ConvertNumber";
import CardCar from "./Card_Car/CardCar";
import "./scss/DisplayCar.scss";
import { useEffect, useState } from "react";
import { getMonthYear } from "../../utils/formatDate";
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";

function DisplayCar(props){
    const { setPage } = props;
    const searchParams = new URLSearchParams(location.search);
    const [list, setList] = useState({
        num : 0,
        minPrice: 0,
        maxPrice : 0,
        cars : []
    })


    useEffect(() => {
        const fetchCars = async() => {
            try {
                const queryString = searchParams.toString();
                const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/v1/car?${queryString}`);
                setList(res.data);
                setPage(Math.ceil(res.data.num/6));
            } catch(error) {
                toast.error(error.response?.data?.message || "Lỗi khi lấy danh sách xe!" );
            }
        }
        fetchCars();
        
    }, [searchParams.toString()]);


    return (
        <>
            <div className="home__content__main__display">
                <ToastContainer />
                <h1 className="home__content__main__display--title">Mua bán oto - Xe ô tô cũ - Xe hơi mới toàn quốc</h1>
                <p className="home__content__main__display--description">Có {convertNum(list.num)} tin bán xe giá từ {list.minPrice} triệu đến {Math.floor(Number(list.maxPrice)/1000)} tỷ {Number(list.maxPrice)%1000} triệu cập nhập mới nhất {getMonthYear()}</p>
                <div className="home__content__main__display__list">
                    {
                        list?.cars.length > 0 && 
                        list?.cars.map((item, index) => (
                            <Link to={`/chi-tiet-xe/${item.slug}`} className="home__content__main__display__list-item" key={index}>
                                <CardCar item={item} />
                            </Link>
                        ))
                    }
                </div>
            </div>
        </>
    )
};
export default DisplayCar;