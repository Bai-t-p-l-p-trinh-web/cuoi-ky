import CarFilter from "../../components/CarFilter";
import DisplayCar from "../../components/DisplayCar";
import Filter from "../../components/Filter";
import PaginationHome from "../../components/Pagination/Pagination_Home";
import HomeSwiper from "../../components/Swiper";
import "./Home.scss";
function Home(){
    return (
        <>
            <div className="home">
                <div className="container">
                    <HomeSwiper/>
                    <div className="home__content">
                        <Filter/>
                        <div className="home__content__main">
                            <CarFilter/>
                            <DisplayCar/>
                            <PaginationHome max_page={69}/>
                        </div>  
                    </div>
                </div>
            </div>
        </>
    )
};

export default Home;