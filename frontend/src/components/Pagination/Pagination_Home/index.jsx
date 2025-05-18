import { useEffect, useState } from "react";
import { GrPrevious, GrNext  } from "react-icons/gr";
import "./../scss/Pagination_Home.scss"
function PaginationHome({max_page}){
    const [curPage, setCurPage] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        const page = Number(params.get("page")) || 1;
        return page;
    })
    
    const setPage = (num) => {
        setCurPage(num);
    }
    const pageUp = () => {
        setCurPage((prev) => {
            if(prev < max_page) return prev + 1;
            return max_page;
        })
    }
    const pageDown = () => {
        setCurPage((prev) => {
            if(prev > 1) return prev - 1;
            return 1;
        })
    }
    
    useEffect(() => {
        const url = new URL(window.location.href);
        url.searchParams.set("page", curPage);
        window.history.replaceState({}, "", url);
    }, [curPage]);

    return (
        <>
            <div className="home__content__pagination">
                <button className="home__content__pagination--page" onClick={pageDown}> <GrPrevious /> </button>
                {
                    curPage <= 6 ? 
                    <>
                        {
                            Array(curPage - 1).fill().map((_, page_index) => (
                                <button key={page_index} className="home__content__pagination--page" onClick={() => {setPage(page_index+1)}}>{page_index + 1}</button>
                            ))
                        }
                    </>
                    :
                    <>
                    {
                        Array(2).fill().map((_, page_index) => (
                            <button key={page_index} className="home__content__pagination--page" onClick={() => {setPage(page_index+1)}}>{page_index + 1}</button>
                        ))
                    }
                    <span className="home__content__pagination__dots">...</span>
                    {
                        Array(2).fill().map((_, page_index) => (
                            <button key={page_index + 2} className="home__content__pagination--page" onClick={() => {setPage(curPage - 2 + page_index)}}>{curPage - 2 + page_index}</button>
                        ))
                    }
                    </>
                }
                <button className="home__content__pagination--page current">{curPage}</button>
                {
                    (max_page - curPage <= 5) ?
                    <>
                        {
                            Array(max_page - curPage).fill().map((_, page_index) => (
                                <button key={page_index} className="home__content__pagination--page" onClick={() => {setPage(curPage + 1 + page_index)}}>{curPage + 1 + page_index}</button>
                            ))
                        }
                    </>
                    :
                    <>
                        {
                            Array(2).fill().map((_, page_index) => (
                                <button key={page_index} className="home__content__pagination--page" onClick={() => {setPage(curPage + 1 + page_index)}}>{curPage + 1 + page_index}</button>
                            ))
                        }
                        <span className="home__content__pagination__dots">...</span>
                        {
                            Array(2).fill().map((_, page_index) => (
                                <button key={page_index + 2} className="home__content__pagination--page" onClick={() => {setPage(max_page - 1 + page_index)}}>{max_page - 1 + page_index}</button>
                            ))
                        }
                    </>
                }
                <button className="home__content__pagination--page" onClick={pageUp}> <GrNext /> </button>
            </div>
        </>
    )
};
export default PaginationHome;