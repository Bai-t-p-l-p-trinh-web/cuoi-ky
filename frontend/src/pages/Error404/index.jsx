import { useNavigate } from "react-router-dom";
import "./scss/Error404.scss";

function Error404() {
  const navigate = useNavigate();
  const handleRefresh = () => {
    window.location.reload();
  };
  const handleHome = () => {
    navigate("/");
  };
  return (
    <>
      <div className="error">
        <img className="error__img" src="/error-404.svg" alt="Không tìm thấy" />
        <h3 className="error__title">Không tìm thấy nội dung</h3>
        <p className="error__description">
          Trang bạn đang tìm kiếm có thể bị xóa hoặc không tồn tại
        </p>
        <div className="error__buttons">
          <button className="error__refresh" onClick={handleRefresh}>
            Làm mới
          </button>
          <button className="error__home" onClick={handleHome}>
            Trang chủ
          </button>
        </div>
      </div>
    </>
  );
}
export default Error404;
