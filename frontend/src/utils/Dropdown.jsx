export function MouseEnter(e, RectBounding, type, ArrowCoords){
    console.log("IN");
    const background = document.querySelector('.dropdownBackground');
    const arrow = background.querySelector('.arrow');

    e.classList.add('trigger-enter');
    setTimeout(() => {
        e.classList.add('trigger-enter-active');
    }, 150);

    const dropdown = e.querySelector('.dropdown');
    const dropdownCoords = dropdown.getBoundingClientRect();
    
    const coords = {
        height: dropdownCoords.height,
        width: dropdownCoords.width,
        top: dropdownCoords.top - RectBounding.top,
        left: dropdownCoords.left - RectBounding.left,
    };

    background.classList.add('open');
    background.style.setProperty('width', `${coords.width}px`);
    background.style.setProperty('height', `${coords.height}px`);
    background.style.setProperty('transform', `translate(${coords.left}px, ${coords.top}px)`);
    arrow.style.setProperty(type, `${ArrowCoords}px`);
    
};

export function MouseOut(e){
    e.classList.remove('trigger-enter');
    e.classList.remove('trigger-enter-active');

    const background = document.querySelector('.dropdownBackground');
    background.classList.remove('open');
}