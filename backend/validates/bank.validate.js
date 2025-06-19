const { body } = require("express-validator");

const validateBankInfo = [
  body("bankName")
    .notEmpty()
    .withMessage("Tên ngân hàng không được để trống")
    .isLength({ min: 2, max: 100 })
    .withMessage("Tên ngân hàng phải từ 2-100 ký tự"),

  body("bankCode")
    .notEmpty()
    .withMessage("Mã ngân hàng không được để trống")
    .matches(/^[0-9]{6}$/)
    .withMessage("Mã ngân hàng phải là 6 chữ số"),

  body("accountNumber")
    .notEmpty()
    .withMessage("Số tài khoản không được để trống")
    .matches(/^[0-9]{8,20}$/)
    .withMessage("Số tài khoản phải từ 8-20 chữ số"),

  body("accountHolder")
    .notEmpty()
    .withMessage("Chủ tài khoản không được để trống")
    .isLength({ min: 2, max: 100 })
    .withMessage("Tên chủ tài khoản phải từ 2-100 ký tự")
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/)
    .withMessage("Tên chủ tài khoản chỉ được chứa chữ cái và khoảng trắng"),
];

const validateCarBankInfo = [
  body("sellerBankInfo.bankName")
    .notEmpty()
    .withMessage("Tên ngân hàng không được để trống"),

  body("sellerBankInfo.bankCode")
    .notEmpty()
    .withMessage("Mã ngân hàng không được để trống")
    .matches(/^[0-9]{6}$/)
    .withMessage("Mã ngân hàng phải là 6 chữ số"),

  body("sellerBankInfo.accountNumber")
    .notEmpty()
    .withMessage("Số tài khoản không được để trống")
    .matches(/^[0-9]{8,20}$/)
    .withMessage("Số tài khoản phải từ 8-20 chữ số"),

  body("sellerBankInfo.accountHolder")
    .notEmpty()
    .withMessage("Chủ tài khoản không được để trống")
    .isLength({ min: 2, max: 100 })
    .withMessage("Tên chủ tài khoản phải từ 2-100 ký tự"),
];

const validateRefundBankInfo = [
  body("refundBankInfo.bankName")
    .notEmpty()
    .withMessage("Tên ngân hàng nhận tiền hoàn không được để trống"),

  body("refundBankInfo.bankCode")
    .notEmpty()
    .withMessage("Mã ngân hàng không được để trống"),

  body("refundBankInfo.accountNumber")
    .notEmpty()
    .withMessage("Số tài khoản nhận tiền hoàn không được để trống"),

  body("refundBankInfo.accountHolder")
    .notEmpty()
    .withMessage("Chủ tài khoản nhận tiền hoàn không được để trống"),
];

module.exports = {
  validateBankInfo,
  validateCarBankInfo,
  validateRefundBankInfo,
};
