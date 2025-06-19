import { useState } from "react";
import CarFilter from "../../components/CarFilter";
import DisplayCar from "../../components/DisplayCar";
import Filter from "../../components/Filter";
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
                            <DisplayCar />
                            
                        </div>  
                    </div>
                </div>
            </div>
        </>
    )
};

export default Home;