import { useEffect, useState, useRef } from "react";
import { CiSearch } from "react-icons/ci";
import { useNavigate, useLocation } from "react-router-dom";
import "./scss/Car_Filter.scss";

function CarFilter() {
    const [keyword, setKeyword] = useState("");
    const debounceTimeout = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const kw = params.get("keyword") || "";
        setKeyword(kw);
    }, [location.search]);

    const updateURLAndReload = (value) => {
        const params = new URLSearchParams(location.search);
        
        if (value.trim() === "") {
            params.delete("keyword");
        } else {
            params.set("keyword", value);
        }

        navigate({
            pathname: location.pathname,
            search: params.toString(),
        }, { replace: true });
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setKeyword(value);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            updateURLAndReload(value);
        }, 400); 
    };

    return (
        <>
            <form className="home__content__main__filter" onSubmit={(e) => e.preventDefault()}>
                <CiSearch className="home__content__main__filter--icon" />
                <input
                    name="keyword"
                    className="home__content__main__filter--input"
                    placeholder="Tìm kiếm xe theo Hãng xe, Dòng xe hoặc Từ khóa"
                    value={keyword}
                    onChange={handleChange}
                />
            </form>
        </>
    );
}

export default CarFilter;
