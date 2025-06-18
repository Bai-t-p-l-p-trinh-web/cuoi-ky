import { useState } from "react";
import { useParams } from "react-router-dom";
import "./scss/SellerInfo.scss";

function SellerInfo() {
    const { slugSeller } = useParams();
    const [seller, setSeller] = useState({
        name: "Sinh viên 1 tốt",
        email: "n23dccn069@student.ptithcm.edu.vn",
        avatar: "https://res.cloudinary.com/dpabf2tar/image/upload/c_crop,w_960,h_960,x_218,y_0/q1sfg4vjv2dzxzok6g1d.jpg",
        createdAt: "2025-06-06T14:40:30.808Z",
        phone: "0356446244",
        address: "97 Man Thiện",
        city: "Hồ Chí Minh",
        district: "Thủ Đức",
        contactEmail: "xuantryingbetter@gmail.com",
        contactFacebook: "https://www.facebook.com/",
        contactLinkedin: "https://www.linkedin.com/feed/",
        contactZalo: "0345454545",
        statistic: {
            star: 4.3,
            total_order: 120
        }
    });

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