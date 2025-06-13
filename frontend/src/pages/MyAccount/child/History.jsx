import { ToastContainer, toast } from "react-toastify";
import { LiaCarSideSolid } from "react-icons/lia";
import { PiCheckCircleLight, PiSealCheckBold } from "react-icons/pi";
import { FaRegEdit } from "react-icons/fa";
import { MdOutlinePendingActions, MdDoNotDisturbAlt } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { AiOutlineFileDone } from "react-icons/ai";
import { RiDeleteBin5Line, RiSortNumberAsc, RiSortNumberDesc } from "react-icons/ri";
import "../scss/History.scss";
import { Link } from "react-router-dom";
import { converStatusRequest, shortenString } from "../../../utils/Status";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { getDate } from "../../../utils/formatDate";

function History() {
    const [requests, setRequests] = useState([]);
    const [requestIds, setRequestIds] = useState([]);
    const [originRequests, setOriginRequests] = useState([]);
    const [filterRequest, setFilterRequest] = useState({
        status: "",
        search: "",
        sort: ""
    });
    const resultFilter = useRef([]);
    const [requestPickeds, setRequestPickeds] = useState([]);
    
    const [currentPage, setCurrentPage] = useState(1);
    const requestsPerPage = 5; 

    useEffect(() => {
        setRequestIds(() => {
            let IdsArray = requests.map((request) => request.id);
            let IdsArraySorted = [...IdsArray].sort();
            return IdsArraySorted;
        });
    }, [requests]);

    useEffect(() => {
        const getRequests = async () => {
            try {
                const respondsRequest = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/v1/requestAdd`, {
                    withCredentials: true 
                });
                setOriginRequests(respondsRequest.data);
                setRequests(respondsRequest.data);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Lỗi khi tìm yêu cầu!');
            }
        };
        getRequests();
    }, []);

    const handleChangeStatus = (status) => {
        setFilterRequest((prev) => ({
            ...prev,
            status
        }));
        setCurrentPage(1); 
    };

    const handleChangeSort = () => {
        const currentSort = filterRequest.sort;
        let sort = '';
        if (!currentSort) sort = 'asc';
        else if (currentSort === 'asc') sort = 'desc';
        else sort = '';

        setFilterRequest((prev) => ({
            ...prev,
            sort
        }));
        setCurrentPage(1); 
    };

    const handleChangeSearch = (search) => {
        setFilterRequest((prev) => ({
            ...prev,
            search
        }));
        setCurrentPage(1); 
    };

    const FilterByStatus = (status) => {
        if (!status) return;
        resultFilter.current = resultFilter.current.filter(request => request.status === status);
    };

    const FilterBySearch = (search) => {
        if (!search) return;
        const regex = new RegExp(search, 'i');
        resultFilter.current = resultFilter.current.filter(request => regex.test(request.name));
    };

    const FilterBySort = (sort) => {
        if (!sort) return;
        if (sort === 'asc') {
            resultFilter.current = resultFilter.current.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else {
            resultFilter.current = resultFilter.current.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
    };

    useEffect(() => {
        if (!originRequests || originRequests.length === 0) return;
        const { status, search, sort } = filterRequest;
        resultFilter.current = [...originRequests];
        FilterByStatus(status);
        FilterBySearch(search);
        FilterBySort(sort);
        setRequests(resultFilter.current);
        setCurrentPage(1); 
    }, [filterRequest, originRequests]);

    const arraysEqual = (a, b) => {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    };

    const addId = (id) => {
        if (!requestPickeds.includes(id)) {
            setRequestPickeds((prev) => {
                const arr = [...prev];
                for (let i = 0; i < arr.length; i++) {
                    if (id.localeCompare(arr[i]) < 0) {
                        arr.splice(i, 0, id);
                        return arr;
                    }
                }
                arr.push(id);
                return arr;
            });
        } else {
            setRequestPickeds((prev) => prev.filter(requestId => requestId !== id));
        }
    };

    const addAllIds = () => {
        if (arraysEqual(requestIds, requestPickeds)) {
            setRequestPickeds([]);
        } else {
            setRequestPickeds([...requestIds]);
        }
    };

    const indexOfLastRequest = currentPage * requestsPerPage;
    const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
    const currentRequests = requests.slice(indexOfFirstRequest, indexOfLastRequest);
    const totalPages = Math.ceil(requests.length / requestsPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5; // Số trang tối đa hiển thị
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    className={`history__pagination__button ${currentPage === i ? 'active' : ''}`}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </button>
            );
        }

        return pageNumbers;
    };

    return (
        <>
            <div className="history">
                <ToastContainer />
                <div className="history__header">
                    <div className="history__header__title">
                        <div className="history__header__title__contain">
                            <LiaCarSideSolid />
                        </div>
                        <span className="history__header__title__span">Inspection Cars</span>
                    </div>
                </div>
                <h3 className="history__title">Yêu cầu của tôi</h3>
                <div className="history__contain">
                    <div className="history__options">
                        <ul className="history__status__list">
                            <li className={`history__status ${!filterRequest.status ? 'picked' : ''}`} onClick={() => handleChangeStatus('')}>
                                <PiCheckCircleLight className="history__status__svg" />
                                <span className="history__status__span">Tất cả</span>
                            </li>
                            <li className={`history__status ${filterRequest.status === 'pending' ? 'picked' : ''}`} onClick={() => handleChangeStatus('pending')}>
                                <MdOutlinePendingActions className="history__status__svg" />
                                <span className="history__status__span">Chờ duyệt</span>
                            </li>
                            <li className={`history__status ${filterRequest.status === 'checked' ? 'picked' : ''}`} onClick={() => handleChangeStatus('checked')}>
                                <PiSealCheckBold className="history__status__svg" />
                                <span className="history__status__span">Đã duyệt</span>
                            </li>
                            <li className={`history__status ${filterRequest.status === 'done' ? 'picked' : ''}`} onClick={() => handleChangeStatus('done')}>
                                <AiOutlineFileDone className="history__status__svg" />
                                <span className="history__status__span">Hoàn thành</span>
                            </li>
                            <li className={`history__status ${filterRequest.status === 'reject' ? 'picked' : ''}`} onClick={() => handleChangeStatus('reject')}>
                                <MdDoNotDisturbAlt className="history__status__svg" />
                                <span className="history__status__span">Từ chối</span>
                            </li>
                        </ul>
                        <div className="history__filters">
                            <div className="history__search">
                                <CiSearch className="history__search__svg" />
                                <input
                                    type="text"
                                    name="search"
                                    className="history__search__input"
                                    placeholder="Tìm kiếm..."
                                    value={filterRequest.search}
                                    onChange={(e) => handleChangeSearch(e.target.value)}
                                />
                            </div>
                            <div className="history__sort">
                                <button className="history__sort__button" onClick={handleChangeSort}>
                                    {!filterRequest.sort && <img src="/unsorted.svg" alt="unsorted" />}
                                    {filterRequest.sort === 'asc' && <RiSortNumberAsc />}
                                    {filterRequest.sort === 'desc' && <RiSortNumberDesc />}
                                    <span>Sort</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <table className="history__table">
                        <thead className="history__table__thead">
                            <tr className="history__table__tr">
                                <th className="history__table__th--checkbox">
                                    <input
                                        type="checkbox"
                                        checked={arraysEqual(requestPickeds, requestIds)}
                                        onChange={addAllIds}
                                    />
                                </th>
                                <th className="history__table__th--title">Xe</th>
                                <th className="history__table__th--createdAt">Ngày làm đơn</th>
                                <th className="history__table__th--status">Trạng thái</th>
                                <th className="history__table__th--functions">Chức năng</th>
                            </tr>
                        </thead>
                        <tbody className="history__table__tbody">
                            {currentRequests && currentRequests.length > 0 ? (
                                currentRequests.map((request, r_index) => (
                                    <tr key={r_index} className="history__table__tr">
                                        <td className="history__table__td--checkbox">
                                            <input
                                                type="checkbox"
                                                checked={requestPickeds.includes(request.id)}
                                                onChange={() => addId(request.id)}
                                            />
                                        </td>
                                        <td className="history__table__td--title">
                                            <div className="history__table__item__image__contain">
                                                <img src={request.img_demo} alt="Ảnh xe" />
                                            </div>
                                            <span className="history__table__item__name">{shortenString(request.name)}</span>
                                        </td>
                                        <td className="history__table__td--createdAt">
                                            {getDate(request.createdAt)}
                                        </td>
                                        <td className="history__table__td--status">
                                            <span data-type={request.status}>{converStatusRequest(request.status)}</span>
                                        </td>
                                        <td className="history__table__td--functions">
                                            <Link
                                                to={`/request-detail/${request.slug}/${request.status === 'reject' ? 'done' : (request.status === 'pending' ? 'info' : (request.status === 'checked' ? 'verify' : request.status))}`}
                                                className="history__functions__link edit"
                                            >
                                                <FaRegEdit className="history__functions__svg" />
                                                <span className="history__functions__span">Chỉnh sửa</span>
                                            </Link>
                                            {request.status === "pending" && (
                                                <button className="history__functions__delete">
                                                    <RiDeleteBin5Line className="history__functions__svg" />
                                                    <span className="history__functions__span">Xóa</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                        Không có yêu cầu nào để hiển thị
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {totalPages > 1 && (
                        <div className="history__pagination">
                            <button
                                className="history__pagination__button"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            {renderPageNumbers()}
                            <button
                                className="history__pagination__button"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default History;