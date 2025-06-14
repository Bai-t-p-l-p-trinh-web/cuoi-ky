import "./scss/Filter_3.scss";
import { FaChevronDown } from "react-icons/fa";
import { useState } from "react";
import "./child/Filter_In_3";
import Filter_In_3 from "./child/Filter_In_3";
function Filter_3(props){
    const { data, ReloadAllPage } = props; 
    const {title, icon, Types, query_name} = data;
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
                    <Filter_In_3 data={{Types, query_name}} ReloadAllPage={ReloadAllPage}/>
                }
                
            </div>
        </>
    ) 
};
export default Filter_3;