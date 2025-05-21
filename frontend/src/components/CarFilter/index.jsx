import { CiSearch } from "react-icons/ci";
import "./scss/Car_Filter.scss";
function CarFilter(){
    return (
        <>
            <form className="home__content__main__filter" method="GET">
                <CiSearch className="home__content__main__filter--icon"/>
                <input name="keyword" className="home__content__main__filter--input" placeholder="Tìm kiếm xe theo Hãng xe, Dòng xe hoặc Từ khóa"/>
            </form>
        </>
    )
};
export default CarFilter;