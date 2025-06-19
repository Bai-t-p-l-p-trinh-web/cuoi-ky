const express = require("express");
const router = express.Router();
const refundController = require("./refund.controller");
const authMiddleware = require("../auth/auth.middleware");
const { body, param, query } = require("express-validator");
const { handleValidationErrors } = require("../validates/validation.helper");

// Middleware xác thực cho tất cả routes
router.use(authMiddleware.requireAuth);

/**
 * @route POST /api/refunds
 * @desc Tạo yêu cầu hoàn tiền
 * @access Private (Buyer only)
 */
router.post(
  "/",
  [
    body("orderId")
      .notEmpty()
      .withMessage("ID đơn hàng không được để trống")
      .isMongoId()
      .withMessage("ID đơn hàng không hợp lệ"),
    body("reason")
      .isIn([
        "buyer_changed_mind",
        "car_not_as_described",
        "seller_fraud",
        "delivery_failed",
        "other",
      ])
      .withMessage("Lý do hoàn tiền không hợp lệ"),
    body("description")
      .notEmpty()
      .withMessage("Mô tả không được để trống")
      .isLength({ min: 10, max: 1000 })
      .withMessage("Mô tả phải từ 10 đến 1000 ký tự"),
    body("evidence")
      .optional()
      .isArray()
      .withMessage("Bằng chứng phải là mảng URL"),
    body("evidence.*")
      .optional()
      .isURL()
      .withMessage("Bằng chứng phải là URL hợp lệ"),
    handleValidationErrors,
  ],
  refundController.createRefund
);

/**
 * @route PUT /api/refunds/:refundId/seller-response
 * @desc Seller phản hồi yêu cầu hoàn tiền
 * @access Private (Seller only)
 */
router.put(
  "/:refundId/seller-response",
  [
    param("refundId")
      .isMongoId()
      .withMessage("ID yêu cầu hoàn tiền không hợp lệ"),
    body("agreed").isBoolean().withMessage("Agreed phải là boolean"),
    body("reason")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Lý do không được quá 500 ký tự"),
    body("evidence")
      .optional()
      .isArray()
      .withMessage("Bằng chứng phải là mảng URL"),
    body("evidence.*")
      .optional()
      .isURL()
      .withMessage("Bằng chứng phải là URL hợp lệ"),
    handleValidationErrors,
  ],
  refundController.sellerResponse
);

/**
 * @route PUT /api/refunds/:refundId/confirm-car-return
 * @desc Xác nhận seller đã nhận lại xe
 * @access Private (Seller only)
 */
router.put(
  "/:refundId/confirm-car-return",
  [
    param("refundId")
      .isMongoId()
      .withMessage("ID yêu cầu hoàn tiền không hợp lệ"),
    body("evidence")
      .optional()
      .isArray()
      .withMessage("Bằng chứng phải là mảng URL"),
    body("evidence.*")
      .optional()
      .isURL()
      .withMessage("Bằng chứng phải là URL hợp lệ"),
    body("notes")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Ghi chú không được quá 500 ký tự"),
    handleValidationErrors,
  ],
  refundController.confirmCarReturn
);

/**
 * @route PUT /api/refunds/:refundId/admin-process
 * @desc Admin xử lý yêu cầu hoàn tiền
 * @access Private (Admin only)
 */
router.put(
  "/:refundId/admin-process",
  [
    param("refundId")
      .isMongoId()
      .withMessage("ID yêu cầu hoàn tiền không hợp lệ"),
    body("approved").isBoolean().withMessage("Approved phải là boolean"),
    body("deductions")
      .optional()
      .isObject()
      .withMessage("Deductions phải là object"),
    body("deductions.serviceFee")
      .optional()
      .isNumeric()
      .withMessage("Phí dịch vụ phải là số"),
    body("deductions.shippingFee")
      .optional()
      .isNumeric()
      .withMessage("Phí vận chuyển phải là số"),
    body("deductions.damageFee")
      .optional()
      .isNumeric()
      .withMessage("Phí thiệt hại phải là số"),
    body("deductions.otherFees")
      .optional()
      .isNumeric()
      .withMessage("Phí khác phải là số"),
    body("finalRefundAmount")
      .optional()
      .isNumeric()
      .withMessage("Số tiền hoàn cuối cùng phải là số"),
    body("adminNotes")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Ghi chú admin không được quá 1000 ký tự"),
    body("refundTransaction")
      .optional()
      .isObject()
      .withMessage("Thông tin giao dịch hoàn tiền phải là object"),
    handleValidationErrors,
  ],
  authMiddleware.requireAdmin,
  refundController.adminProcessRefund
);

/**
 * @route GET /api/refunds
 * @desc Lấy danh sách yêu cầu hoàn tiền
 * @access Private
 */
router.get(
  "/",
  [
    query("role")
      .optional()
      .isIn(["requester", "seller", "all"])
      .withMessage("Role phải là requester, seller hoặc all"),
    query("status")
      .optional()
      .isIn(["requested", "processing", "approved", "rejected", "completed"])
      .withMessage("Trạng thái không hợp lệ"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Trang phải là số nguyên dương"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit phải từ 1 đến 100"),
    query("sortBy")
      .optional()
      .isIn(["createdAt", "updatedAt", "requestedAmount", "status"])
      .withMessage("SortBy không hợp lệ"),
    query("sortOrder")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("SortOrder phải là asc hoặc desc"),
    handleValidationErrors,
  ],
  refundController.getRefunds
);

/**
 * @route GET /api/refunds/:refundId
 * @desc Lấy chi tiết yêu cầu hoàn tiền
 * @access Private
 */
router.get(
  "/:refundId",
  [
    param("refundId")
      .isMongoId()
      .withMessage("ID yêu cầu hoàn tiền không hợp lệ"),
    handleValidationErrors,
  ],
  refundController.getRefundDetail
);

module.exports = router;
