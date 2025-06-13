
import { FUEL_TO_NAME } from "../../../../constants/CarFormField";
import { converStatusRequest } from "../../../utils/Status";
import { getDate } from "../../../utils/formatDate";
import { useOutletContext, useParams } from "react-router-dom";

import "../scss/RequestInfo.scss";

function RequestInfo() {
    const { slugRequest  } = useParams();
    const  { request } = useOutletContext();

    return (
        <>
            <div className="requestInfo">
                <h3 className="requestInfo__title">Thông tin form điền đăng ký xe</h3>
                <div className="requestInfo__image__contain">
                    <div className="requestInfo__image__contain__border">
                        <img className="requestInfo__image" src={request.img_demo || "https://nftcalendar.io/storage/uploads/2022/02/21/image-not-found_0221202211372462137974b6c1a.png"} alt="image demo" />
                    </div>
                    
                </div>
                <div className="requestInfo__content">
                    <div className="requestInfo__item">
                        <span className="requestInfo__item--name">Tên xe</span>
                        <span className="requestInfo__item--value">{request.name || "..."}</span>
                    </div>

                    <div className="requestInfo__item">
                        <span className="requestInfo__item--name">Xe mua vào</span>
                        <span className="requestInfo__item--value">{request.year || "..."}</span>
                    </div>

                    <div className="requestInfo__item">
                        <span className="requestInfo__item--name">Số km đã sử dụng</span>
                        <span className="requestInfo__item--value">{request?.km === undefined || request?.km === null ? "..." : request.km}</span>
                    </div>

                    <div className="requestInfo__item">
                        <span className="requestInfo__item--name">Nhiên liệu sử dụng</span>
                        <span className="requestInfo__item--value">{FUEL_TO_NAME[request.fuel] || "..."}</span>
                    </div>

                    <div className="requestInfo__item">
                        <span className="requestInfo__item--name">Số ghế ngồi</span>
                        <span className="requestInfo__item--value">{request.seat_capacity || "..."}</span>
                    </div>

                    <div className="requestInfo__item">
                        <span className="requestInfo__item--name">Địa điểm muốn kiểm tra</span>
                        <span className="requestInfo__item--value">{request.location || "..."}</span>
                    </div>

                    <div className="requestInfo__item">
                        <span className="requestInfo__item--name">Tình trạng hiện tại</span>
                        <span className="requestInfo__item--value">{converStatusRequest(request.status)}</span>
                    </div>

                    <div className="requestInfo__item">
                        <span className="requestInfo__item--name"> Ngày tạo form</span>
                        <span className="requestInfo__item--value">{getDate(request.createdAt)}</span>
                    </div>
                </div>
            </div>
        </>
    )
};
export default RequestInfo;