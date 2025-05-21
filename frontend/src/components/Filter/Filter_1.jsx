import { FaChevronDown } from "react-icons/fa";
import "./scss/Filter_1.scss";
import Filter_In_1 from "./child/Filter_In_1";
import { useState } from "react";
function Filter_1({data}){
    const {title, search_holder, icon, filter_list} = data;
    const [isOpenFilters, setIsOpenFilters] = useState([]);
    const [isOpenList, setIsOpenList] = useState(false);
    const ToggleFilter = (num) =>{
        if(isOpenFilters.includes(num)) {
            setIsOpenFilters(prev => prev.filter(item => item !== num));
        }
        else {
            setIsOpenFilters(prev => [...prev, num]);
        }
    }
    const ToggleOpenList = () => {
        setIsOpenList(prev => !prev);
    }
    return (
        <>
            <div className="home__content__filter">
                <h2 className="home__content__filter-title" onClick={ToggleOpenList}>
                    <span className="home__content__filter-title-icon">{icon}</span>
                    <span className="home__content__filter-title-content">{title}</span>
                    <FaChevronDown className={"home__content__filter-title-arrow " + (isOpenList ? "rotate " : "")}/>
                </h2>
                {
                    isOpenList && 
                    <ul className="home__content__filter-list">
                    {filter_list.length > 0 && 
                        filter_list.map((item, index) => (
                            <li className="home__content__filter-list-item" key={index} >
                                <div className="home__content__filter-list-item__containner">
                                    <input type="checkbox" data-choose-filter={`hang_xe ${item.title}`}/>
                                    <h3 className="home__content__filter-list-item__title">{item.title}</h3>
                                    
                                    <FaChevronDown className={"home__content__filter-list-item__button " + (isOpenFilters.includes(index) ? "rotate " : "")} onClick={() => {ToggleFilter(index)}}/>
                                </div>
                                
                                {   
                                    (item.children.length > 0 && isOpenFilters.includes(index)) && 
                                    <Filter_In_1 data={item.children}/>
                                }
                            </li>
                        ))
                    }
                </ul>
                }
                
            </div>
        </>
    )
};
export default Filter_1;