import { useEffect, useState } from "react";
import { GrPrevious, GrNext } from "react-icons/gr";
import "./../scss/Pagination_Home.scss";

function PaginationHome({ max_page }) {
  const [curPage, setCurPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get("page")) || 1;
    return Math.min(page, max_page);
  });


const updateUrlWithoutReload = (page) => {
    const url = new URL(window.location.href);
    url.searchParams.set("page", page);
    window.history.replaceState({}, "", url);
};

useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageInUrl = parseInt(params.get("page"));

    if (!pageInUrl || pageInUrl !== curPage) {
        updateUrlWithoutReload(curPage);
    }
}, [curPage]);

  const goToPage = (page) => {
    if (page >= 1 && page <= max_page) setCurPage(page);
  };

  const renderPageButtons = () => {
    const pages = [];

    // Always show first 2 pages
    if (curPage > 4) {
      pages.push(1, 2, "...");
    } else {
      for (let i = 1; i < curPage; i++) {
        pages.push(i);
      }
    }

    // Show current - 2 to current + 2
    for (let i = Math.max(1, curPage - 2); i <= Math.min(max_page, curPage + 2); i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    // Always show last 2 pages
    if (curPage < max_page - 3) {
      pages.push("...", max_page - 1, max_page);
    } else {
      for (let i = curPage + 1; i <= max_page; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
    }

    return pages.map((page, index) => {
      if (page === "...") {
        return (
          <span key={`dots-${index}`} className="home__content__pagination__dots">
            ...
          </span>
        );
      }

      return (
        <button
          key={page}
          className={`home__content__pagination--page ${
            page === curPage ? "current" : ""
          }`}
          onClick={() => goToPage(page)}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div className="home__content__pagination">
      <button
        className="home__content__pagination--page"
        onClick={() => goToPage(curPage - 1)}
        disabled={curPage === 1}
      >
        <GrPrevious />
      </button>

      {renderPageButtons()}

      <button
        className="home__content__pagination--page"
        onClick={() => goToPage(curPage + 1)}
        disabled={curPage === max_page}
      >
        <GrNext />
      </button>
    </div>
  );
}

export default PaginationHome;
