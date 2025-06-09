import { ToastContainer, toast } from "react-toastify";
import { LiaCarSideSolid } from "react-icons/lia";
import { PiCheckCircleLight, PiMoneyThin  } from "react-icons/pi";
import { FaRegEdit } from "react-icons/fa";
import { MdOutlineSell } from "react-icons/md";
import { GiPayMoney } from "react-icons/gi";
import { GrHide } from "react-icons/gr";
import { CgDetailsMore } from "react-icons/cg";
import { CiSearch } from "react-icons/ci";
import { CiCirclePlus } from "react-icons/ci";
import { RiDeleteBin5Line, RiSortNumberAsc, RiSortNumberDesc  } from "react-icons/ri";
import "../scss/ManageCar.scss";
import { Link } from "react-router-dom";
import { convertCurrency } from "../../../utils/ConvertNumber";
import { convertStatus, shortenString } from "../../../utils/Status";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
function ManageCar(){
    const [cars, setCars] = useState([]);

    const [carSlugs, setCarSlugs] = useState([]);
    const [originCars, setOriginCars] = useState([]);
    const [filterCar, setFilterCar] = useState({
        status : "",
        search : "",
        sort : ""
    });
    const resultFilter = useRef([]);
    const [carPickedSlugs, setCarPickedSlugs] = useState([]);

    useEffect(() => {
        setCarSlugs(() => {
            let SlugsArray = cars.map((car) => car.slug);
            let SlugsArraySorted = [...SlugsArray].sort();
            return SlugsArraySorted;
        });
    }, [cars]);

    useEffect(() => {
        const getCars = async() => {
            try {
                const respondsCar = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/v1/car/display`, {
                    withCredentials : true
                });
                setOriginCars(respondsCar.data);
                setCars(respondsCar.data);
            } catch(error) {
                toast.error(error.response?.data?.message || 'Lỗi khi tìm xe');
            }
        };
        getCars();
    }, []);

    // filters, sort, search 
    const handleChangeStatus = (status) => {
        setFilterCar((prev) => (
            {
                ...prev,
                status
            }
        ));
    }

    const handleChangeSort = () => {
        const currentSort = filterCar.sort;
        let sort = '';
        if(!currentSort) sort = 'asc';
        else if(currentSort === 'asc') sort = 'desc';
        else sort = '';

        setFilterCar((prev) => (
            {
                ...prev,
                sort
            }
        ));
    }

    const handleChangeSearch = (search) => {
        setFilterCar((prev) => (
            {
                ...prev,
                search
            }
        ));
    }

    const FilterByStatus = (status) => {
        if(!status) return;

        resultFilter.current = resultFilter.current.filter(car => car.status === status);
    }

    const FilterBySearch = (search) => {
        if(!search) return;

        const regex = new RegExp(search, "i");

        resultFilter.current = resultFilter.current.filter(car => regex.test(car.title));
    }

    const FilterBySort = (sort) => {
        if(!sort) return;

        if(sort === 'asc') {
            resultFilter.current = resultFilter.current.sort((a,b) => a.price - b.price);
        } else {
            resultFilter.current = resultFilter.current.sort((a,b) => b.price - a.price);
        }
    }

    useEffect(() => {
        if(!originCars || originCars.length === 0) return;
        const {status, search, sort} = filterCar;
        resultFilter.current = [...originCars];
        FilterByStatus(status);
        FilterBySearch(search);
        FilterBySort(sort);

        setCars(resultFilter.current);

    }, [filterCar]);
    // end filters, sort, search 

    // so sánh 2 phần tử bằng nhau (đúng thứ tự => so sánh)
    const arraysEqual = (a, b) => {
        if(a.length !== b.length) return false;

        for(let i = 0; i<a.length; i++) {
            if(a[i] !== b[i]) return false;
        }
        return true;
    }

    const addSlug = (slug) => {
        if(!carPickedSlugs.includes(slug)){
            setCarPickedSlugs((prev) => {
                const arr = [...prev];

                for (let i = 0; i < arr.length; i++) {
                    if(slug.localeCompare(arr[i]) < 0) {
                        arr.splice(i, 0, slug);
                        return arr;
                    }
                }
                arr.push(slug);
                return arr;
            })
        } else {
            setCarPickedSlugs((carPickedSlug) => carPickedSlugs.filter(carSlug => carSlug !== slug));
        }
    }

    const addAllSlug = () => {
        if(arraysEqual(carSlugs, carPickedSlugs)){
            setCarPickedSlugs([]);
        } else {
            setCarPickedSlugs([...carSlugs]);
        }
        
    }



    return (
        <>
            <div className="manageCar">
                <ToastContainer/>
                <div className="manageCar__header">
                    <div className="manageCar__header__title">
                        <div className="manageCar__header__title__contain">
                            <LiaCarSideSolid/>
                        </div>
                        <span className="manageCar__header__title__span">Cars</span>
                    </div>
                </div>
                <h3 className="manageCar__title">Xe của tôi</h3>
                <div className="manageCar__contain">
                    <div className="manageCar__options">
                        <ul className="manageCar__status__list">
                            <li className={`manageCar__status ${!filterCar.status ? 'picked' : ''}`} onClick={() => {handleChangeStatus('')}}>
                                <PiCheckCircleLight className="manageCar__status__svg" />
                                <span className="manageCar__status__span">Tất cả</span>
                            </li>

                            <li className={`manageCar__status ${filterCar.status === 'selling' ? 'picked' : ''}`} onClick={() => {handleChangeStatus('selling')}}>
                                <MdOutlineSell className="manageCar__status__svg" />
                                <span className="manageCar__status__span">Đang bán</span>
                            </li>

                            <li className={`manageCar__status ${filterCar.status === 'deposited' ? 'picked' : ''}`} onClick={() => {handleChangeStatus('deposited')}}>
                                <GiPayMoney className="manageCar__status__svg" />
                                <span className="manageCar__status__span">Đặt cọc</span>
                            </li>

                            <li className={`manageCar__status ${filterCar.status === 'hiden' ? 'picked' : ''}`} onClick={() => {handleChangeStatus('hidden')}}>
                                <GrHide className="manageCar__status__svg" />
                                <span className="manageCar__status__span">Ẩn</span>
                            </li> 

                            <li className={`manageCar__status ${filterCar.status === 'sold' ? 'picked' : ''}`} onClick={() => {handleChangeStatus('sold')}}>
                                <PiMoneyThin className="manageCar__status__svg" />
                                <span className="manageCar__status__span">Đã bán</span>
                            </li>
                        </ul>

                        <div className="manageCar__filters">
                            <div className="manageCar__search">
                                <CiSearch className="manageCar__search__svg"/>
                                <input type="text" name="search" className="manageCar__search__input" placeholder="Tìm kiếm..." value={filterCar.search} onChange={(e) => {handleChangeSearch(e.target.value)}} />
                            </div>
                            <div className="manageCar__sort">
                                <button className="manageCar__sort__button" onClick={handleChangeSort}>
                                    {
                                        !filterCar.sort
                                        &&
                                        <img src="/unsorted.svg" alt="unsorted" />
                                    }
                                    {
                                        filterCar.sort === 'asc'
                                        &&
                                        <RiSortNumberAsc/>
                                    }
                                    {
                                        filterCar.sort === 'desc'
                                        &&
                                        <RiSortNumberDesc/>
                                    }
                                    <span>Sort</span>
                                </button>
                            </div>
                            <div className="manageCar__add">
                                <Link to="request_add" className="manageCar__link">
                                    <CiCirclePlus className="manageCar__link__svg"/>
                                    <span className="manageCar__link__span">Thêm mới</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <table className="manageCar__table">
                        <thead className="manageCar__table__thead">
                            <tr className="manageCar__table__tr">
                                <th className="manageCar__table__th--checkbox">
                                    <input type="checkbox" checked={arraysEqual(carSlugs, carPickedSlugs)} onChange={addAllSlug}/>
                                </th>
                                <th className="manageCar__table__th--title">
                                    Xe
                                </th>
                                <th className="manageCar__table__th--price">
                                    Giá
                                </th>
                                <th className="manageCar__table__th--status">
                                    Trạng thái
                                </th>
                                <th className="manageCar__table__th--functions">
                                    Chức năng
                                </th>
                            </tr>
                        </thead>
                        
                        <tbody className="manageCar__table__tbody">
                            {
                                cars &&
                                cars.map((car, c_index) => (
                                    <tr key={c_index} className="manageCar__table__tr">
                                        <td className="manageCar__table__td--checkbox">
                                            <input type="checkbox" checked={carPickedSlugs.includes(car.slug)} onChange={() => {addSlug(car.slug)}}/>
                                        </td>
                                        <td className="manageCar__table__td--title">
                                            <div className="manageCar__table__item__image__contain">
                                                <img src={car.img_src} alt="Ảnh xe" />
                                            </div>
                                            <span className="manageCar__table__item__name">{shortenString(car.title)}</span>
                                        </td>
                                        <td className="manageCar__table__td--price">
                                            {convertCurrency(car.price)}
                                        </td>
                                        <td className="manageCar__table__td--status">
                                            <span data-type={car.status}>{convertStatus(car.status)}</span>
                                        </td>
                                        <td className="manageCar__table__td--functions">
                                            <Link to="" className="manageCar__functions__link">
                                                <CgDetailsMore className="manageCar__functions__svg"/>
                                                <span className="manageCar__functions__span">Chi tiết</span>
                                            </Link>
                                        

                                            <Link to="" className="manageCar__functions__link edit">
                                                <FaRegEdit className="manageCar__functions__svg"/>
                                                <span className="manageCar__functions__span">Chỉnh sửa</span>
                                            </Link>

                                            <button className="manageCar__functions__delete">
                                                <RiDeleteBin5Line className="manageCar__functions__svg"/>
                                                <span className="manageCar__functions__span">Xóa</span>
                                            </button>
                                            
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>

            </div>
        </>
    )
};
export default ManageCar;