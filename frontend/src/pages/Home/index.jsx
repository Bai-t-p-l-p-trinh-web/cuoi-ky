import { useState } from "react";
import CarFilter from "../../components/CarFilter";
import DisplayCar from "../../components/DisplayCar";
import Filter from "../../components/Filter";
import PaginationHome from "../../components/Pagination/Pagination_Home";
import HomeSwiper from "../../components/Swiper";
import "./Home.scss";
function Home(){
    const [page, setPage] = useState(1);
    const [reloadPage, setReloadPage] = useState(0);
    const ReloadAllPage = () => {
        setReloadPage((prev) => prev + 1);
    }
    
    return (
        <>
            <div className="home">
                <div className="container">
                    <HomeSwiper/>
                    <div className="home__content">
                        <Filter ReloadAllPage={ReloadAllPage}/>
                        <div className="home__content__main">
                            <CarFilter/>
                            <DisplayCar setPage={setPage} />
                            {
                                page > 0
                                &&
                                <PaginationHome max_page={page}/>
                            }
                            
                        </div>  
                    </div>
                </div>
            </div>
        </>
    )
};

export default Home;