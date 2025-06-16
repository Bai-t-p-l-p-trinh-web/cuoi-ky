import { useNavigate } from "react-router-dom";
import { FaHome, FaRedo, FaSearch, FaCar } from "react-icons/fa";
import "./scss/Error404.scss";

function Error404() {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleHome = () => {
    navigate("/");
  };

  const handleSearchCars = () => {
    navigate("/ban-xe");
  };

  const handleContact = () => {
    navigate("/lien-he");
  };

  return (
    <>
      <div className="error">
        <div className="error__content">
          <img
            className="error__img"
            src="/error-404.svg"
            alt="Không tìm thấy"
          />

          <h1 className="error__title">Oops! Trang không tồn tại</h1>

          <p className="error__description">
            Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời
            không khả dụng.
            <br />
            Đừng lo lắng, hãy thử các lựa chọn bên dưới!
          </p>

          <div className="error__buttons">
            <button className="error__home" onClick={handleHome}>
              <FaHome />
              Về trang chủ
            </button>
            <button className="error__refresh" onClick={handleRefresh}>
              <FaRedo />
              Thử lại
            </button>
          </div>

          <div className="error__suggestions">
            <h3>Có thể bạn đang tìm:</h3>
            <div className="error__links">
              <button className="error__link" onClick={handleSearchCars}>
                <FaCar />
                <span>Tìm xe để mua</span>
              </button>
              <button
                className="error__link"
                onClick={() => navigate("/gioi-thieu")}
              >
                <FaSearch />
                <span>Giới thiệu FakeAuto</span>
              </button>
              <button className="error__link" onClick={handleContact}>
                <FaSearch />
                <span>Liên hệ hỗ trợ</span>
              </button>
            </div>
          </div>

          <div className="error__help">
            <p>
              Nếu vẫn gặp vấn đề, vui lòng liên hệ:
              <a href="tel:19006969"> 1900 6969</a> hoặc
              <a href="mailto:support@fakeauto.vn"> support@fakeauto.vn</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
export default Error404;
