import { useState } from "react";

function Filter_In_3({data}){
    const {Types, query_name} = data;
    
    const [types_searched, setTypesSearched] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        const searched = params.get(query_name);
        let arraySearched = null;
        if(searched){
            arraySearched = searched.split("+");
        }
        
        return arraySearched ? arraySearched : [];
    });
    
    const handleChange = (e) => {
        let type_query = e.target.getAttribute('data-type');
        
        setTypesSearched(prev => {
            let updated;
            if(prev.includes(type_query)){
                updated = prev.filter(type => type !== type_query);
            } else {
                updated = [...prev, type_query];
            }

            const queryStr = updated.join("+");
            const url = new URL(window.location.href);

            if(updated.length > 0){
                url.searchParams.set(query_name, queryStr);
            } else {
                url.searchParams.delete(query_name);
            }
            
            window.history.replaceState({}, '', url);

            return updated;
        });
    }
    return (
        <>
            <ul className="home__content__filter__pick">
                {Types.length > 0 && 
                    Types.map((type, index) => (
                        <li key={index} className="home__content__filter__pick-item">
                            <input type="checkbox" className="home__content__filter__pick-item--input" defaultChecked={types_searched.includes(type.type_query)} data-type={type.type_query} onChange={handleChange}/>
                            <span className="home__content__filter__pick-item--name">{type.type_name}</span>
                        </li>
                    ))
                }
            </ul>
        </>
    )
};
export default Filter_In_3;