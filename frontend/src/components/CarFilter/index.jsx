import { useEffect, useState, useRef } from "react";
import { CiSearch } from "react-icons/ci";
import "./scss/Car_Filter.scss";

function CarFilter(props) {
    const { ReloadAllPage } = props;
    const [keyword, setKeyword] = useState("");
    const debounceTimeout = useRef(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const kw = params.get("keyword") || "";
        setKeyword(kw);
    }, []);

    const updateURLAndReload = (value) => {
        const url = new URL(window.location.href);
        if (value.trim() === "") {
            url.searchParams.delete("keyword");
        } else {
            url.searchParams.set("keyword", value);
        }

        window.history.replaceState({}, '', url);
        ReloadAllPage();
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
