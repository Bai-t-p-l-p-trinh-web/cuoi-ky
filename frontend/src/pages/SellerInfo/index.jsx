import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify"; 
import "./scss/SellerInfo.scss";
import apiClient from "../../utils/axiosConfig";

function SellerInfo() {
    const { slugSeller } = useParams();
    const [seller, setSeller] = useState({
        name: "",
        email: "",
        avatar: "",
        createdAt: "",
        phone: "",
        address: "",
        city: "",
        district: "",
        contactEmail: "",
        contactFacebook: "",
        contactLinkedin: "",
        contactZalo: "",
        statistic: {
            star: 4.5,
            total_order: 2
        }
    });

    useEffect(() => {
        const fetchSeller = async() => {
            try {
                const responseSeller = await apiClient.get(`${import.meta.env.VITE_SERVER_URL}/api/v1/user/${slugSeller}`);
                setSeller((prev) => ({
                    ...prev,
                    ...responseSeller.data
                }));
                
            } catch(error) {
                toast.error(error.response?.data?.message || "Lỗi khi lấy thông tin người bán!");
            }
        }
        fetchSeller();
    }, []);

    return (
        <div className="seller-info">
            <div className="seller-info__header">
                <img 
                    src={seller.avatar} 
                    alt={`${seller.name}'s avatar`} 
                    className="seller-info__avatar"
                />
                <div className="seller-info__header-details">
                    <h1 className="seller-info__name">{seller.name}</h1>
                    <p className="seller-info__joined">
                        Gia nhập từ: {new Date(seller.createdAt).toLocaleDateString()}
                    </p>
                    <div className="seller-info__stats">
                        <span className="seller-info__stat">
                            Đánh giá: {seller.statistic.star} ★
                        </span>
                        <span className="seller-info__stat">
                            Tổng đơn: {seller.statistic.total_order}
                        </span>
                    </div>
                </div>
            </div>

            <div className="seller-info__contact">
                <h2 className="seller-info__section-title">Thông tin liên hệ</h2>
                <ul className="seller-info__contact-list">
                    <li className="seller-info__contact-item">
                        <span className="seller-info__contact-label">Email:</span> 
                        <a href={`mailto:${seller.contactEmail}`} className="seller-info__contact-link">
                            {seller.contactEmail}
                        </a>
                    </li>
                    <li className="seller-info__contact-item">
                        <span className="seller-info__contact-label">Phone:</span> 
                        {seller.phone}
                    </li>
                    <li className="seller-info__contact-item">
                        <span className="seller-info__contact-label">Zalo:</span> 
                        {seller.contactZalo}
                    </li>
                    <li className="seller-info__contact-item">
                        <span className="seller-info__contact-label">Facebook:</span> 
                        <a href={seller.contactFacebook} target="_blank" rel="noopener noreferrer" className="seller-info__contact-link">
                            Facebook Profile
                        </a>
                    </li>
                    <li className="seller-info__contact-item">
                        <span className="seller-info__contact-label">LinkedIn:</span> 
                        <a href={seller.contactLinkedin} target="_blank" rel="noopener noreferrer" className="seller-info__contact-link">
                            LinkedIn Profile
                        </a>
                    </li>
                </ul>
            </div>

            <div className="seller-info__location">
                <h2 className="seller-info__section-title">Địa chỉ</h2>
                <p className="seller-info__location-detail">
                    {seller.address}, {seller.district}, {seller.city}
                </p>
            </div>
        </div>
    );
}

export default SellerInfo;