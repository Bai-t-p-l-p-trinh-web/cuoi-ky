import { useOutletContext } from "react-router-dom";
import "../scss/RequestDone.scss";

function RequestDone(){
    const  { request } = useOutletContext();

    const PdfViewer = () => {
        if(!request.secure_url) return '';
        const encodedUrl = encodeURIComponent(request.secure_url);
        const viewerUrl = `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
        return viewerUrl;
    }


    return (
        <>
            <div className="requestDone">
                {
                    (request.status === "pending" || !request.status) 
                    ?
                    (
                        <>
                            <div className="requestDone__result">
                                <span className="">Đơn duyệt của bạn đang được duyệt vui lòng đợi thêm vài ngày...</span>
                            </div>
                        </>
                    )
                    :
                    (
                        <>
                            <h3 className="requestDone__title">ĐÃ KIỂM TRA THÔNG TIN XE</h3>
                            <div className="requestDone__result">
                                <span className="requestDone__result__title">Kết quả</span>
                                <span className={`requestDone__result__value ${request.status}`}><b>{request.status !== "reject" ? "Thông qua" : "Không qua"}</b></span>
                            </div>
                            <div className="requestDone__pdf">
                                <iframe className="requestDone__pdf__iframe" src={PdfViewer()} ></iframe>
                            </div>
                        </>
                    )
                }
            </div>
            
        </>
    )
};
export default RequestDone;