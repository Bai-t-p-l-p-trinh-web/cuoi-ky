import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UploadMultipleButton from "../../components/UploadButtonMultiples";
import { Cloudinary } from "@cloudinary/url-gen";
import { FaMapMarkerAlt } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "./scss/StaffExamine.scss";
import apiClient from "../../utils/axiosConfig";

function StaffExamine() {
  const { slugCar } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState({
    name: "",
    year: "",
    km: 0,
    fuel: "",
    seat_capacity: 0,
    location: "",
  });

  const [examine, setExamine] = useState({
    isCorrectName: false,
    isCorrectYear: false,
    isCorrectKm: false,
    isCorrectSeat_Capacity: false,
    isFuel_Gasoline: false,
    isFuel_Oil: false,
    isFuel_Electric: false,
  });

  const [images, setImages] = useState([]);
  const [isApproved, setIsApproved] = useState(true);
  const [message, setMessage] = useState("");

  const isLoading = useRef(false);

  const [price, setPrice] = useState({
    price_recommend_low : "",
    price_recommend_high : ""
  })

  const cloudName = import.meta.env.VITE_CLOUDINARY_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const cld = new Cloudinary({ cloud: { cloudName } });

  const uwConfig = {
    cloudName,
    uploadPreset,
    cropping: false,
    multiple: true,
    sources: ["local", "url", "camera"],
    folder: "examine-uploads",
  };

  useEffect(() => {
    const getRequest = async () => {
      try {
        const response = await apiClient.get(`/requestAdd/${slugCar}`);
        setCar(response.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi khi lấy yêu cầu!");
      }
    };
    getRequest();
  }, []);

  const handleCheckboxChange = (field) => {
    setExamine((prev) => ({ ...prev, [field]: !prev[field] }));
  };

const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isApproved) {
        const allCorrect = examine.isCorrectName && examine.isCorrectKm && examine.isCorrectSeat_Capacity && examine.isCorrectYear;
        if (allCorrect) {
            return toast.warning("Phải tích ít nhất một thông tin sai để từ chối");
        }
        if (!message.trim()) {
            return toast.warning("Vui lòng nhập lý do từ chối");
        }
    } else {
        const allCorrect = examine.isCorrectName && examine.isCorrectKm && examine.isCorrectSeat_Capacity && examine.isCorrectYear;
        if (!allCorrect) {
            return toast.warning("Phải xác nhận đúng toàn bộ thông tin khi đồng ý");
        }
        if (images.length === 0) {
            return toast.warning("Vui lòng upload ít nhất một ảnh kiểm định");
        }
        if(price.price_recommend_low > price.price_recommend_high) {
            return toast.warning('Giá khuyến nghị từ thấp nhất đến cao nhất!');
        }
    }

    const isLoadingSendRequest = toast.loading('Đang gửi trạng thái!');
    isLoading.current = true;
    try {
        const payload = {
            examine,
            img_src : images,
            message: isApproved ? null : message,
            price_recommend_low : isApproved ? price.price_recommend_low : null,
            price_recommend_high : isApproved ? price.price_recommend_high : null
        };

        if(isApproved) {
            await apiClient.patch(`/requestAdd/${slugCar}/checked`, payload);
            toast.update(isLoadingSendRequest, {
                render : 'Gửi kết quả kiểm định thành công',
                type : 'success',
                isLoading : false,
                autoClose : 3000
            });
            setTimeout(() => {
                navigate('/my_account/examine_requests');
            }, 3000);
        } else {
            await apiClient.patch(`/requestAdd/${slugCar}/reject`, payload);
            toast.update(isLoadingSendRequest, {
                render : 'Gửi kết quả kiểm định thành công',
                type : 'success',
                isLoading : false,
                autoClose : 3000
            });
            setTimeout(() => {
                navigate('/my_account/examine_requests');
            }, 3000);
        }
    } catch (err) {
        toast.update(isLoadingSendRequest, {
            render : err.response?.data?.message || "Lỗi khi gửi kết quả kiểm định!",
            type : 'error',
            isLoading : false,
            autoClose : 3000
        });
    } finally {
        isLoading.current = false;
    }
};

return (
    <div className="staff-examine">
        <ToastContainer/>
        <h2>Thông tin kiểm định xe</h2>

        <div className="staff-examine__info">
        <p><strong>Tên xe:</strong> {car.name}</p>
        <p><strong>Năm sản xuất:</strong> {car.year}</p>
        <p><strong>Km đã đi:</strong> {car.km}</p>
        <p><strong>Nhiên liệu:</strong> {car.fuel}</p>
        <p><strong>Số chỗ ngồi:</strong> {car.seat_capacity}</p>
        </div>

        <div className="staff-examine__location">
        <FaMapMarkerAlt style={{ color: "red", marginRight: 5 }} />
        <strong>Địa điểm kiểm tra:</strong> {car.location}
        </div>

        <div className="staff-examine__toggle">
        <label>
            <input
            type="radio"
            name="verify"
            checked={isApproved}
            onChange={() => setIsApproved(true)}
            />
            Đồng ý
        </label>
        <label>
            <input
            type="radio"
            name="verify"
            checked={!isApproved}
            onChange={() => setIsApproved(false)}
            />
            Từ chối
        </label>
        </div>

        <div className="staff-examine__pictures-preview">
        <h4>Ảnh đã upload:</h4>
        <div className="images-preview">
            {images.map((img, idx) => (
            <img
                key={idx}
                src={img}
                alt={`img-${idx}`}
                width="100"
                style={{ borderRadius: 6, marginRight: 10 }}
            />
            ))}
        </div>
        </div>

        {isApproved && (
        <UploadMultipleButton
            cloudName={cloudName}
            uwConfig={uwConfig}
            setUploadImages={setImages}
        />
        )}

        <form className="staff-examine__form" onSubmit={handleSubmit}>
            <h4>Xác nhận thông tin:</h4>
            <label>
                <input
                type="checkbox"
                checked={examine.isCorrectName}
                onChange={() => handleCheckboxChange("isCorrectName")}
                />
                Tên xe đúng
            </label>
            <br />
            <label>
                <input
                type="checkbox"
                checked={examine.isCorrectYear}
                onChange={() => handleCheckboxChange("isCorrectYear")}
                />
                Năm sản xuất đúng
            </label>
            <br />
            <label>
                <input
                type="checkbox"
                checked={examine.isCorrectKm}
                onChange={() => handleCheckboxChange("isCorrectKm")}
                />
                Km đã đi đúng
            </label>
            <br />
            <label>
                <input
                type="checkbox"
                checked={examine.isCorrectSeat_Capacity}
                onChange={() => handleCheckboxChange("isCorrectSeat_Capacity")}
                />
                Số chỗ ngồi đúng
            </label>
            <br />
            <p><strong>Chọn đúng loại nhiên liệu:</strong></p>
            <label>
                <input
                type="checkbox"
                checked={examine.isFuel_Gasoline}
                onChange={() => handleCheckboxChange("isFuel_Gasoline")}
                />
                Xăng (Gasoline)
            </label>
            <br />
            <label>
                <input
                type="checkbox"
                checked={examine.isFuel_Oil}
                onChange={() => handleCheckboxChange("isFuel_Oil")}
                />
                Dầu (Oil)
            </label>
            <br />
            <label>
                <input
                type="checkbox"
                checked={examine.isFuel_Electric}
                onChange={() => handleCheckboxChange("isFuel_Electric")}
                />
                Điện (Electric)
            </label>

            {!isApproved && (
                <>
                    <br />
                    <label>
                        <p><strong>Lý do từ chối:</strong></p>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows="3"
                            placeholder="Nhập lý do từ chối yêu cầu kiểm định..."
                        />
                    </label>
                </>
            )}
            {isApproved && (
            <>
                <div className="staff-examine__price">
                <h4>Giá cho thuê gợi ý:</h4>
                <label>
                    Tối thiểu (VNĐ):
                    <input
                    type="number"
                    value={price.price_recommend_low}
                    onChange={(e) =>
                        setPrice((prev) => ({
                        ...prev,
                        price_recommend_low: e.target.value,
                        }))
                    }
                    required
                    min={0}
                    />
                </label>
                <br />
                <label>
                    Tối đa (VNĐ):
                    <input
                        type="number"
                        value={price.price_recommend_high}
                        onChange={(e) =>
                            setPrice((prev) => ({
                            ...prev,
                            price_recommend_high: e.target.value,
                            }))
                        }
                        required
                        min={0}
                    />
                </label>
                </div>
            </>
            )}

            <br />
            <button type="submit" className={`btn-submit ${isApproved ? 'btn-accept' : 'btn-reject'}`} disabled = {isLoading.current}>
                {isApproved ? "Xác nhận đồng ý" : "Từ chối yêu cầu"}
            </button>
        </form>
    </div>
);
}

export default StaffExamine;
