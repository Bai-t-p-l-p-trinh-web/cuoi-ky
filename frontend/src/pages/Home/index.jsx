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
                    </div>
                </div>
            </div>
        </>
    )
};

export default Home;