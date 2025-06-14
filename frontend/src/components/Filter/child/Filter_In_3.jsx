import { useState } from "react";

function Filter_In_3(props) {
  const {data, ReloadAllPage} = props;
  const { Types, query_name } = data;

  const [types_searched, setTypesSearched] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const searched = params.get(query_name);
    return searched ? searched.split("+") : [];
  });

  const [filterText, setFilterText] = useState("");

  const handleChange = (e) => {
    const type_query = e.target.getAttribute("data-type");

    setTypesSearched((prev) => {
      let updated;
      if (prev.includes(type_query)) {
        updated = prev.filter((type) => type !== type_query);
      } else {
        updated = [...prev, type_query];
      }

      const queryStr = updated.join("+");
      const url = new URL(window.location.href);

      if (updated.length > 0) {
        url.searchParams.set(query_name, queryStr);
      } else {
        url.searchParams.delete(query_name);
      }

      window.history.replaceState({}, "", url);
      return updated;
    });

    ReloadAllPage();
  };

  const filteredTypes = Types.filter((type) =>
    type.type_name.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="home__content__filter__pick">
      <input
        type="text"
        placeholder="Tìm kiếm..."
        className="home__content__filter__pick-search"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />
      <ul>
        {filteredTypes.length > 0 ? (
          filteredTypes.map((type, index) => (
            <li key={index} className="home__content__filter__pick-item">
              <input
                type="checkbox"
                className="home__content__filter__pick-item--input"
                defaultChecked={types_searched.includes(type.type_query)}
                data-type={type.type_query}
                onChange={handleChange}
              />
              <span className="home__content__filter__pick-item--name">
                {type.type_name}
              </span>
            </li>
          ))
        ) : (
          <li className="home__content__filter__pick-item--empty">Không tìm thấy</li>
        )}
      </ul>
    </div>
  );
}

export default Filter_In_3;
