import "./scss/Filter_2.scss";
import { FaChevronDown } from "react-icons/fa";
import { useState } from "react";
import Filter_In_2 from "./child/Filter_In_2";
function Filter_2({data}){
    const {title, icon, defaultMin, defaultMax, gapMin_Max, unit, query_name} = data;
    const [isOpenList, setIsOpenList] = useState(false);
    
    const ToggleOpenList = () => {
        setIsOpenList(prev => !prev);
    }
    return (
        <>
            <div className="home__content__filter">
                <h2 className="home__content__filter-title" onClick={ToggleOpenList}>
                    <span className="home__content__filter-title-icon">{icon}</span>
                    <span className="home__content__filter-title-content">{title}</span>
                    <FaChevronDown className="home__content__filter-title-arrow"/>
                </h2>
                {
                    isOpenList && 
                    <Filter_In_2 data={{defaultMin, defaultMax, gapMin_Max, unit, query_name}}/>
                }
                
            </div>
        </>
    ) 
};
export default Filter_2;