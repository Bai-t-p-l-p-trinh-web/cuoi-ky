import { Link, useNavigate, useLocation } from "react-router-dom";
import { convertNum, convertCurrency } from "../../utils/ConvertNumber";
import CardCar from "./Card_Car/CardCar";
import "./scss/DisplayCar.scss";
import { useEffect, useState } from "react";
import { getMonthYear } from "../../utils/formatDate";
import apiClient from "../../utils/axiosConfig";
import { toast, ToastContainer } from "react-toastify";
import { GrPrevious, GrNext } from "react-icons/gr";

function DisplayCar() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const pageFromURL = parseInt(searchParams.get("page")) || 1;

  const [list, setList] = useState({
    num: 0,
    minPrice: 0,
    maxPrice: 0,
    cars: [],
  });
  const [curPage, setCurPage] = useState(pageFromURL);
  const limit = 6;
  const maxPage = Math.ceil(list.num / limit);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const queryString = new URLSearchParams(location.search);
        const res = await apiClient.get(`/car?${queryString.toString()}`);
        setList(res.data);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Lỗi khi lấy danh sách xe!"
        );
      }
    };
    fetchCars();
  }, [location.search]);

  const goToPage = (page) => {
    if (page < 1 || page > maxPage) return;
    searchParams.set("page", page);
    navigate({ search: searchParams.toString() });
    setCurPage(page);
  };

  return (
    <>
      <ToastContainer />
      <div className="home__content__main__display">
        <h1 className="home__content__main__display--title">
          Mua bán oto - Xe ô tô cũ - Xe hơi mới toàn quốc
        </h1>
        <p className="home__content__main__display--description">
          Có {convertNum(list.num)} tin bán xe giá từ{" "}
          {convertCurrency(list.minPrice)} đến {convertCurrency(list.maxPrice)}{" "}
          cập nhật mới nhất {getMonthYear()}
        </p>

        <div className="home__content__main__display__list">
          {list?.cars.length > 0 &&
            list?.cars.map((item, index) => (
              <Link
                to={`chi-tiet-xe/${item.slug}`}
                className="home__content__main__display__list-item"
                key={index}
              >
                <CardCar item={item} />
              </Link>
            ))}
        </div>

        {/* Pagination */}
        {maxPage > 1 && (
          <div className="home__content__pagination">
            <button
              className="home__content__pagination--page"
              onClick={() => goToPage(curPage - 1)}
              disabled={curPage === 1}
            >
              <GrPrevious />
            </button>

            {Array.from({ length: maxPage }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`home__content__pagination--page ${
                  page === curPage ? "current" : ""
                }`}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="home__content__pagination--page"
              onClick={() => goToPage(curPage + 1)}
              disabled={curPage === maxPage}
            >
              <GrNext />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default DisplayCar;
