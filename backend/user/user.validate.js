const validator = require("validator");

const validateUpdateInfo = (req, res, next) => {
  const {
    oldPassword,
    newPassword,
    avatar,
    contactFacebook,
    contactZalo,
    contactEmail,
    contactLinkedin
  } = req.body;

  if (oldPassword && !newPassword) {
    return res.status(400).json({ message: "Vui lòng nhập mật khẩu mới" });
  }

  if (contactEmail && !validator.isEmail(contactEmail)) {
    return res.status(400).json({ message: "Email không hợp lệ" });
  }

  if (contactFacebook && contactFacebook.length > 100) {
    return res.status(400).json({ message: "Đường dẫn Facebook quá dài" });
  }

  if (contactZalo && contactZalo.length > 100) {
    return res.status(400).json({ message: "Zalo quá dài" });
  }

  if (contactLinkedin && contactLinkedin.length > 100) {
    return res.status(400).json({ message: "LinkedIn quá dài" });
  }

  next();
};

module.exports = {
    validateUpdateInfo
};
