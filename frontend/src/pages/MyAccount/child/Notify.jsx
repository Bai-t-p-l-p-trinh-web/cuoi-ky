import { useState, useEffect } from "react";
import "../scss/Notify.scss";
import apiClient from "../../../utils/axiosConfig";
import { formatTimeStamp } from "../../../utils/formatDate";

function Notify() {
  const [notices, setNotices] = useState([]);
  const [curPage, setCurPage] = useState(1);
  const noticesPerPage = 5;

  useEffect(() => {
    const getNotices = async() => {
        try {
            const res = await apiClient.get('/notices');
            console.log(res.data);
            setNotices(res.data);
        } catch(error) {
            toast.error(error.response?.data?.message || 'Lỗi khi lấy thông báo!');
        }
    }
    getNotices();
  }, []);

  const totalPages = Math.ceil(notices.length / noticesPerPage);
  const startIndex = (curPage - 1) * noticesPerPage;
  const currentNotices = notices.slice(startIndex, startIndex + noticesPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurPage(page);
  };

  return (
    <div className="notify">
      <h2 className="notify__title">Thông báo của bạn</h2>

      <div className="notify__list">
        {currentNotices.map((notice, index) => (
          <div className="notify__item" key={index}>
            <p className="notify__content">{notice.content}</p>
            <span className="notify__date">{formatTimeStamp(notice.createdAt)}</span>
          </div>
        ))}
        {currentNotices.length === 0 && (
          <p className="notify__empty">Không có thông báo nào.</p>
        )}
      </div>

      <div className="notify__pagination">
        <button
          className="notify__pagination-btn"
          onClick={() => goToPage(curPage - 1)}
          disabled={curPage === 1}
        >
          ←
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`notify__pagination-btn ${
              i + 1 === curPage ? "notify__pagination-btn--active" : ""
            }`}
            onClick={() => goToPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          className="notify__pagination-btn"
          onClick={() => goToPage(curPage + 1)}
          disabled={curPage === totalPages}
        >
          →
        </button>
      </div>
    </div>
  );
}

export default Notify;
