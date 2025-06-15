const DEFAULT_IMAGE = "https://png.pngtree.com/png-vector/20190820/ourmid/pngtree-no-image-vector-illustration-isolated-png-image_1694547.jpg";

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

export function isImageUrlOrDefault(url) {
    if (
      typeof url !== "string" ||
      url.trim() === "" ||
      !url.match(/\.(jpeg|jpg|gif|png|svg|webp)$/i)
    ) {
      return DEFAULT_IMAGE;
    }
    return url;
}

export const converStatusRequest = (status) => {
  if(!status) return "...";

  if(status === "pending") return "Chờ duyệt";

  if(status === "checked") return "Đã duyệt";

  if(status === "done") return "Hoàn thành";

  if(status === "reject") return "Từ chối";

  return "...";
}