export const convertStatus = (status) => {
    if(!status) return "...";

    if(status === "selling") return "Đang bán";

    if(status === "deposited") return "Đặt cọc";

    if(status === "hidden") return "Ẩn";

    if(status === "sold") return "Đã bán";

    return "...";
}

export const shortenString = (str) => {
    if(str.length > 30) {
        return str.slice(0, 30) + "...";
    }
    return str;
}