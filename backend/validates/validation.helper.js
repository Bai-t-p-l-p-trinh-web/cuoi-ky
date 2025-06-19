const { validationResult } = require("express-validator");

/**
 * Middleware xử lý lỗi validation
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log("Validation errors:", errors.array());
    console.log("Request body:", req.body);
    return res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors: errors.array().map((error) => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value,
      })),
    });
  }

  next();
};

/**
 * Validator tùy chỉnh cho MongoDB ObjectId
 */
const isValidObjectId = (value) => {
  return /^[0-9a-fA-F]{24}$/.test(value);
};

/**
 * Validator cho số điện thoại Việt Nam
 */
const isValidVietnamesePhone = (value) => {
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
  return phoneRegex.test(value);
};

/**
 * Validator cho URL hình ảnh
 */
const isValidImageUrl = (value) => {
  const imageRegex = /\.(jpg|jpeg|png|gif|webp)$/i;
  try {
    const url = new URL(value);
    return imageRegex.test(url.pathname);
  } catch {
    return false;
  }
};

/**
 * Validator cho số tiền (VND)
 */
const isValidAmount = (value) => {
  const amount = parseFloat(value);
  return !isNaN(amount) && amount >= 0 && amount <= 999999999999; // Tối đa 999 tỷ
};

/**
 * Sanitizer loại bỏ HTML tags
 */
const sanitizeHtml = (value) => {
  return value.replace(/<[^>]*>/g, "").trim();
};

/**
 * Validator cho biển số xe Việt Nam
 */
const isValidLicensePlate = (value) => {
  // Format: 30A-12345 hoặc 51F1-12345
  const plateRegex = /^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$/;
  return plateRegex.test(value);
};

module.exports = {
  handleValidationErrors,
  isValidObjectId,
  isValidVietnamesePhone,
  isValidImageUrl,
  isValidAmount,
  sanitizeHtml,
  isValidLicensePlate,
};
