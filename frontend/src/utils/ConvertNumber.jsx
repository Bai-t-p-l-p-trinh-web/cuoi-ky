export const convertNum = (num) => {
    let x = Number(num);
    if(isNaN(x)) return "0";
    return x.toLocaleString("en-US");
}
export const convertCurrency = (num) => {
    let x = Number(num);
    if(isNaN(x)) return "Lỗi";
    if(x >= 1000){
        return Math.floor(x/1000) + " tỷ " + (x%1000 == 0 ? "" : (x%1000 + " triệu")) ;
        
    } else {
        return x + " triệu";
    }
}