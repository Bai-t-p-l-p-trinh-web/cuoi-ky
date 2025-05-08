import { useRef, useState } from "react";

function Filter_In_2({data}){
    const {defaultMin, defaultMax, gapMin_Max, unit, query_name} = data;
    const inputMin = useRef(null);
    const inputMax = useRef(null);

    const progress_bar = useRef(null);

    const [minValue, setMinValue] = useState(defaultMin);
    const [maxValue, setMaxValue] = useState(defaultMax);

    const handleChangeValue = (e) => {
        let value_range_min = inputMin.current.value;
        let value_range_max = inputMax.current.value;

        
        if(value_range_max - value_range_min < gapMin_Max){
            if(e.target.getAttribute("data-type") == "range-min"){
                inputMin.current.value = Number(value_range_max) - Number(gapMin_Max);
            } else {
                inputMax.current.value = Number(value_range_min) + Number(gapMin_Max);
            }
        }
        
        if(progress_bar.current){
            progress_bar.current.style.left = Number(inputMin.current.value - defaultMin)/Number(inputMin.current.max - defaultMin)*100 + "%";
            progress_bar.current.style.right = (100 - Number(inputMax.current.value - defaultMin)/Number(inputMax.current.max - defaultMin)*100) + "%";
        }
        setMinValue(Number(inputMin.current.value));
        setMaxValue(Number(inputMax.current.value));
    }
    const handleSubmit = () => {
        let url = new URL(window.location.href);
        url.searchParams.set(query_name + "min", minValue);
        url.searchParams.set(query_name + "max", maxValue);

        window.history.replaceState({}, '', url);
    }
    return (
        <>
            <div className="home__content__filter__range">
                <div className="home__content__filter__range--slide">
                    <div className="home__content__filter__range--slide-progress" ref={progress_bar}></div>
                </div>
                <div className="home__content__filter__range--input">
                    <input type="range" ref={inputMin} className="home__content__filter__range--input-min" min={defaultMin} max={defaultMax} defaultValue={defaultMin} data-type="range-min" onInput={handleChangeValue}/>
                    <input type="range" ref={inputMax} className="home__content__filter__range--input-max" min={defaultMin} max={defaultMax} defaultValue={defaultMax} data-type="range-max" onInput={handleChangeValue}/>
                </div>
                <div className="home__content__filter__range--showValue">
                    
                    <div className="home__content__filter__range--showValue-Min">{minValue} {unit}</div>
                    <div className="home__content__filter__range--showValue-Max">{maxValue} {unit}</div>
                </div>
                <button className="home__content__filter__range--submit" onClick={handleSubmit}>Xác nhận</button>
            </div>
        </>
    )
};
export default Filter_In_2;