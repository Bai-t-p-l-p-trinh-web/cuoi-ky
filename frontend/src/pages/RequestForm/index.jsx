import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useFetchUserInfo } from "../../hooks/useFetchUserInfo";
import "./scss/RequestDetail.scss";
import apiClient from "../../utils/axiosConfig";
function RequestDetail() {
  const { slugRequest } = useParams();
  const navigate = useNavigate();
  const { user, loading, error } = useFetchUserInfo();
  const isLoading = useRef(true);

  const location = useLocation();

  const [request, setRequest] = useState({
    name: "",
    year: "",
    km: "",
    fuel: "",
    seat_capacity: "",
    location: "",
    img_demo: "",
    status: "",
    createdAt: "",
  });

  useEffect(() => {
    const getRequest = async () => {
      try {
        const responseRequest = await apiClient.get(
          `/requestAdd/${slugRequest}`
        );
        setRequest(responseRequest.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi khi tìm yêu cầu !");
      }
    };
    getRequest();
  }, []);

  useEffect(() => {
    if (!loading && isLoading.current == false && !user) {
      toast.error("Người dùng chưa đăng nhập xin vui lòng đăng nhập");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } else if (
      !loading &&
      isLoading.current == false &&
      user &&
      user.role !== "seller"
    ) {
      toast.error("Người dùng phải đăng ký làm người bán trước");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }
    isLoading.current = false;
  }, [user, loading, isLoading.current]);

  const getNavLinkClass = ({ isActive }) => {
    return isActive
      ? "requestDetail__progress__current"
      : "requestDetail__progress__future";
  };

  const IsTargetPath = (targetPath) => {
    return location.pathname === targetPath;
  };

  const getLinkPrev = () => {
    let isInfo = IsTargetPath(`/request-detail/${slugRequest}/info`);
    let isVerify = IsTargetPath(`/request-detail/${slugRequest}/verify`);

    if (isInfo) {
      return `/request-detail/${slugRequest}/info`;
    } else if (isVerify) {
      return `/request-detail/${slugRequest}/info`;
    } else {
      return `/request-detail/${slugRequest}/verify`;
    }
  };

  const DisabledPrev = () => {
    let isInfo = IsTargetPath(`/request-detail/${slugRequest}/info`);

    if (isInfo) return true;
    return false;
  };

  const getLinkNext = () => {
    let isInfo = IsTargetPath(`/request-detail/${slugRequest}/info`);
    let isVerify = IsTargetPath(`/request-detail/${slugRequest}/verify`);

    if (isInfo) {
      return `/request-detail/${slugRequest}/verify`;
    } else if (isVerify) {
      return `/request-detail/${slugRequest}/done`;
    } else {
      return `/request-detail/${slugRequest}/done`;
    }
  };

  const DisabledNext = () => {
    let isDone = IsTargetPath(`/request-detail/${slugRequest}/done`);

    if (isDone) {
      return true;
    }
    return false;
  };

  return (
    <>
      <div className="requestDetail">
        <ToastContainer />
        <div className="requestDetail__progress__gif">
          {IsTargetPath(`/request-detail/${slugRequest}/info`) && (
            <img src="/filling.gif" alt="filling" />
          )}
          {IsTargetPath(`/request-detail/${slugRequest}/verify`) && (
            <img src="/examine.gif" alt="filling" />
          )}
          {IsTargetPath(`/request-detail/${slugRequest}/done`) && (
            <img src="/done.gif" alt="filling" />
          )}
        </div>
        <div className="requestDetail__progress__contain">
          <div className="requestDetail__progress">
            <NavLink
              to={`/request-detail/${slugRequest}/info`}
              className={getNavLinkClass}
            >
              1. Điền thông tin
            </NavLink>
            <div className="requestDetail__progress__horizontal"></div>
            <NavLink
              to={`/request-detail/${slugRequest}/verify`}
              className={getNavLinkClass}
            >
              2. Đợi xác thực
            </NavLink>
            <div className="requestDetail__progress__horizontal"></div>
            <NavLink
              to={`/request-detail/${slugRequest}/done`}
              className={getNavLinkClass}
            >
              3. Xác thực
            </NavLink>
          </div>
        </div>
        <div className="requestDetail__main">
          <Outlet context={{ request }} />
        </div>
        <div className="requestDetail__footer">
          <div className="requestDetail__buttons">
            <button
              onClick={() => {
                navigate(getLinkPrev());
              }}
              disabled={DisabledPrev()}
              className="requestDetail__navigate__prev"
            >
              Trang trước
            </button>
            <button
              onClick={() => {
                navigate(getLinkNext());
              }}
              disabled={DisabledNext()}
              className="requestDetail__navigate__next"
            >
              Trang sau
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default RequestDetail;
