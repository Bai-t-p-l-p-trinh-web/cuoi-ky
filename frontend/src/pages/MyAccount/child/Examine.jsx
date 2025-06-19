import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom"; // để chuyển trang
import apiClient from "../../../utils/axiosConfig";
import "../scss/Examine.scss";

function Examine() {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getRequest = async () => {
      try {
        const response = await apiClient.get(`requestAdd/inspects`);
        setRequests(response.data.data || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi tải dữ liệu");
      }
    };
    getRequest();
  }, []);

  const getStatusLabel = (status) => {
    switch (status) {
      case "done":
        return "Đã duyệt";
      case "pending":
        return "Chờ duyệt";
      case "rejected":
        return "Từ chối";
      default:
        return status;
    }
  };

  return (
    <div className="examine">
      <h2>Danh sách yêu cầu kiểm duyệt</h2>
      <table className="examine-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Ảnh - Tên xe</th>
            <th>Địa điểm</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((item, index) => (
            <tr key={item._id}>
              <td>{index + 1}</td>
              <td className="car-info">
                <img src={item.img_demo} alt={item.name} className="car-img" />
                <span>{item.name}</span>
              </td>
              <td>{item.location}</td>
              <td>
                <span className={`status-tag ${item.status}`}>
                  {getStatusLabel(item.status)}
                </span>
              </td>
              <td>
                <button
                  className="btn-detail"
                  onClick={() => navigate(`/examine/${item.slug}`)}
                >
                  Xem chi tiết
                </button>
              </td>
            </tr>
          ))}
          {requests.length === 0 && (
            <tr>
              <td colSpan="5">Không có yêu cầu nào</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Examine;
