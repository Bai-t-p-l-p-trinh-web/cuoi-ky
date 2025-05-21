import { useState } from "react";

function Filter_In_1({data}){
    const [isOpen, setIsOpen] = useState(true);
    return (
        <>
            <ul className="home__content__filter-list-item__inItem">
            {
                isOpen && 
                data.map((item, index) => (
                    <li className="home__content__filter-list-item__inItem-item" key={index} >
                        <input className="home__content__filter-list-item__inItem-item-input" type="checkbox" data-choose-filter={`hang_xe ${item}`}/>
                        <h4 className="home__content__filter-list-item__inItem-item-title">{item}</h4>
                    </li>
                ))
            }
            </ul>
            
        </>
    )
}
export default Filter_In_1;