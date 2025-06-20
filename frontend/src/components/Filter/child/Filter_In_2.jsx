import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Filter_In_2(props) {
  const { data } = props;
  const { defaultMin, defaultMax, gapMin_Max, unit, query_name } = data;

  const navigate = useNavigate();
  const location = useLocation();

  const inputMin = useRef(null);
  const inputMax = useRef(null);
  const progress_bar = useRef(null);

  const [minValue, setMinValue] = useState(defaultMin);
  const [maxValue, setMaxValue] = useState(defaultMax);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const min = Number(params.get(`${query_name}min`)) || defaultMin;
    const max = Number(params.get(`${query_name}max`)) || defaultMax;

    setMinValue(min);
    setMaxValue(max);

    if (inputMin.current) inputMin.current.value = min;
    if (inputMax.current) inputMax.current.value = max;

    if (progress_bar.current) {
      progress_bar.current.style.left =
        ((min - defaultMin) / (defaultMax - defaultMin)) * 100 + "%";
      progress_bar.current.style.right =
        100 -
        ((max - defaultMin) / (defaultMax - defaultMin)) * 100 +
        "%";
    }
  }, [location.search, defaultMin, defaultMax, query_name]);

  const handleChangeValue = (e) => {
    let value_range_min = Number(inputMin.current.value);
    let value_range_max = Number(inputMax.current.value);

    if (value_range_max - value_range_min < gapMin_Max) {
      if (e.target.getAttribute("data-type") === "range-min") {
        value_range_min = value_range_max - gapMin_Max;
        inputMin.current.value = value_range_min;
      } else {
        value_range_max = value_range_min + gapMin_Max;
        inputMax.current.value = value_range_max;
      }
    }

    if (progress_bar.current) {
      progress_bar.current.style.left =
        ((value_range_min - defaultMin) / (defaultMax - defaultMin)) * 100 +
        "%";
      progress_bar.current.style.right =
        100 -
        ((value_range_max - defaultMin) / (defaultMax - defaultMin)) * 100 +
        "%";
    }

    setMinValue(value_range_min);
    setMaxValue(value_range_max);
  };

  const handleSubmit = () => {
    const params = new URLSearchParams(location.search);

    if (minValue !== defaultMin) {
      params.set(`${query_name}min`, minValue);
    } else {
      params.delete(`${query_name}min`);
    }

    if (maxValue !== defaultMax) {
      params.set(`${query_name}max`, maxValue);
    } else {
      params.delete(`${query_name}max`);
    }

    navigate(
      {
        pathname: location.pathname,
        search: params.toString(),
      },
      { replace: true }
    );
  };

  return (
    <div className="home__content__filter__range">
      <div className="home__content__filter__range--slide">
        <div
          className="home__content__filter__range--slide-progress"
          ref={progress_bar}
        ></div>
      </div>

      <div className="home__content__filter__range--input">
        <input
          type="range"
          ref={inputMin}
          className="home__content__filter__range--input-min"
          min={defaultMin}
          max={defaultMax}
          defaultValue={defaultMin}
          data-type="range-min"
          onInput={handleChangeValue}
        />
        <input
          type="range"
          ref={inputMax}
          className="home__content__filter__range--input-max"
          min={defaultMin}
          max={defaultMax}
          defaultValue={defaultMax}
          data-type="range-max"
          onInput={handleChangeValue}
        />
      </div>

      <div className="home__content__filter__range--showValue">
        <div className="home__content__filter__range--showValue-Min">
          {minValue} {unit}
        </div>
        <div className="home__content__filter__range--showValue-Max">
          {maxValue} {unit}
        </div>
      </div>

      <button
        className="home__content__filter__range--submit"
        onClick={handleSubmit}
      >
        Xác nhận
      </button>
    </div>
  );
}

export default Filter_In_2;
