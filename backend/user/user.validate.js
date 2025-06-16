const validator = require("validator");

const validateUpdateInfo = (req, res, next) => {
  const {
    name,
    phone,
    address,
    city,
    district,
    avatar,
    contactFacebook,
    contactZalo,
    contactEmail,
    contactLinkedin,
  } = req.body;

  // Validate name
  if (name !== undefined && (!name || name.trim().length < 2)) {
    return res.status(400).json({ message: "Tên phải có ít nhất 2 ký tự" });
  }

  // Validate phone (Vietnamese phone number format)
  if (
    phone !== undefined &&
    phone &&
    !validator.isMobilePhone(phone, "vi-VN")
  ) {
    return res.status(400).json({ message: "Số điện thoại không hợp lệ" });
  }

  // Validate contact email
  if (
    contactEmail !== undefined &&
    contactEmail &&
    !validator.isEmail(contactEmail)
  ) {
    return res.status(400).json({ message: "Email liên hệ không hợp lệ" });
  }

  // Validate string lengths
  if (address !== undefined && address && address.length > 200) {
    return res
      .status(400)
      .json({ message: "Địa chỉ quá dài (tối đa 200 ký tự)" });
  }

  if (city !== undefined && city && city.length > 50) {
    return res
      .status(400)
      .json({ message: "Tên thành phố quá dài (tối đa 50 ký tự)" });
  }

  if (district !== undefined && district && district.length > 50) {
    return res
      .status(400)
      .json({ message: "Tên quận/huyện quá dài (tối đa 50 ký tự)" });
  }

  if (
    contactFacebook !== undefined &&
    contactFacebook &&
    contactFacebook.length > 100
  ) {
    return res.status(400).json({ message: "Đường dẫn Facebook quá dài" });
  }

  if (contactZalo !== undefined && contactZalo && contactZalo.length > 100) {
    return res.status(400).json({ message: "Zalo quá dài" });
  }

  if (
    contactLinkedin !== undefined &&
    contactLinkedin &&
    contactLinkedin.length > 100
  ) {
    return res.status(400).json({ message: "LinkedIn quá dài" });
  }

  next();
};

module.exports = {
  validateUpdateInfo,
};
