export const convertNum = (num) => {
  let x = Number(num);
  if (isNaN(x)) return "0";
  return x.toLocaleString("en-US");
};
export const convertCurrency = (num) => {
  let x = Number(num);
  if (isNaN(x)) return "Lỗi";

  // Convert from VND to display format
  if (x >= 1000000000) {
    let ty = Math.floor(x / 1000000000);
    let trieu = Math.floor((x % 1000000000) / 1000000);
    return ty + " tỷ " + (trieu === 0 ? "" : trieu + " triệu");
  } else if (x >= 1000000) {
    return Math.floor(x / 1000000) + " triệu";
  } else if (x >= 1000) {
    return Math.floor(x / 1000) + " nghìn";
  } else {
    return x.toLocaleString("vi-VN") + " đồng";
  }
};
