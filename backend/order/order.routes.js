const express = require("express");
const router = express.Router();
const orderController = require("./order.controller");
const authMiddleware = require("../auth/auth.middleware");
const { body, param, query } = require("express-validator");
const { handleValidationErrors } = require("../validates/validation.helper");

// Middleware xác thực cho tất cả routes
router.use(authMiddleware.requireAuth);

/**
 * @route POST /api/orders
 * @desc Tạo đơn hàng mới
 * @access Private
 */
router.post(
  "/",
  [
    body("carId")
      .notEmpty()
      .withMessage("ID xe không được để trống")
      .isMongoId()
      .withMessage("ID xe không hợp lệ"),
    body("paymentMethod")
      .isIn(["deposit", "full_payment", "direct_transaction"])
      .withMessage("Phương thức thanh toán không hợp lệ"),
    body("depositPercentage")
      .optional()
      .isInt({ min: 10, max: 50 })
      .withMessage("Tỷ lệ đặt cọc phải từ 10% đến 50%"),
    handleValidationErrors,
  ],
  orderController.createOrder
);

/**
 * @route POST /api/orders/confirm-payment
 * @desc Xác nhận đã thanh toán
 * @access Private
 */
router.post(
  "/confirm-payment",
  [
    body("paymentId")
      .notEmpty()
      .withMessage("ID thanh toán không được để trống"),
    // Removed .isMongoId() validation to allow temporary IDs
    body("transactionId")
      .notEmpty()
      .withMessage("Mã giao dịch không được để trống"),
    body("evidence")
      .optional()
      .isArray()
      .withMessage("Bằng chứng phải là mảng URL"),
    handleValidationErrors,
  ],
  orderController.confirmPayment
);

/**
 * @route PUT /api/orders/:orderId/buyer-confirm
 * @desc Buyer xác nhận đã thống nhất với seller
 * @access Private (Buyer only)
 */
router.put(
  "/:orderId/buyer-confirm",
  [
    param("orderId").isMongoId().withMessage("ID đơn hàng không hợp lệ"),
    handleValidationErrors,
  ],
  orderController.buyerConfirmAgreement
);

/**
 * @route POST /api/orders/:orderId/final-payment
 * @desc Tạo thanh toán cuối cho đơn hàng đặt cọc
 * @access Private (Buyer only)
 */
router.post(
  "/:orderId/final-payment",
  [
    param("orderId").isMongoId().withMessage("ID đơn hàng không hợp lệ"),
    handleValidationErrors,
  ],
  orderController.createFinalPayment
);

/**
 * @route PUT /api/orders/:orderId/start-delivery
 * @desc Bắt đầu giao xe
 * @access Private (Buyer or Seller)
 */
router.put(
  "/:orderId/start-delivery",
  [
    param("orderId").isMongoId().withMessage("ID đơn hàng không hợp lệ"),
    body("deliveryInfo")
      .optional()
      .isObject()
      .withMessage("Thông tin giao xe phải là object"),
    body("deliveryInfo.address")
      .optional()
      .notEmpty()
      .withMessage("Địa chỉ giao xe không được để trống"),
    body("deliveryInfo.scheduledDate")
      .optional()
      .isISO8601()
      .withMessage("Ngày giao xe không hợp lệ"),
    handleValidationErrors,
  ],
  orderController.startDelivery
);

/**
 * @route PUT /api/orders/:orderId/confirm-delivery
 * @desc Xác nhận đã giao/nhận xe
 * @access Private (Buyer or Seller)
 */
router.put(
  "/:orderId/confirm-delivery",
  [
    param("orderId").isMongoId().withMessage("ID đơn hàng không hợp lệ"),
    body("images").optional().isArray().withMessage("Ảnh phải là mảng URL"),
    body("documents")
      .optional()
      .isArray()
      .withMessage("Tài liệu phải là mảng URL"),
    body("notes")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Ghi chú không được quá 500 ký tự"),
    handleValidationErrors,
  ],
  orderController.confirmDelivery
);

/**
 * @route PUT /api/orders/:orderId/buyer-final-confirmation
 * @desc Buyer xác nhận cuối cùng (hài lòng hoặc yêu cầu refund)
 * @access Private (Buyer only)
 */
router.put(
  "/:orderId/buyer-final-confirmation",
  [
    param("orderId").isMongoId().withMessage("ID đơn hàng không hợp lệ"),
    body("satisfied").isBoolean().withMessage("Satisfied phải là boolean"),
    body("notes")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Ghi chú không được quá 500 ký tự"),
    handleValidationErrors,
  ],
  orderController.buyerFinalConfirmation
);

/**
 * @route PUT /api/orders/:orderId/cancel
 * @desc Hủy đơn hàng
 * @access Private (Buyer only)
 */
router.put(
  "/:orderId/cancel",
  [
    param("orderId").isMongoId().withMessage("ID đơn hàng không hợp lệ"),
    body("reason")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Lý do hủy không được quá 500 ký tự"),
    handleValidationErrors,
  ],
  orderController.cancelOrder
);

/**
 * @route GET /api/orders
 * @desc Lấy danh sách đơn hàng
 * @access Private
 */
router.get(
  "/",
  [
    query("role")
      .optional()
      .isIn(["buyer", "seller", "all"])
      .withMessage("Role phải là buyer, seller hoặc all"),
    query("status")
      .optional()
      .isIn([
        "awaiting_payment",
        "paid_partial",
        "paid_full",
        "pending_meeting",
        "waiting_confirmation",
        "negotiating",
        "pending_final_payment",
        "delivery_in_progress",
        "delivered",
        "buyer_confirmed",
        "refunding",
        "completed",
        "cancelled_by_buyer",
        "disputed",
      ])
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
      .isIn(["createdAt", "updatedAt", "totalAmount", "status"])
      .withMessage("SortBy không hợp lệ"),
    query("sortOrder")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("SortOrder phải là asc hoặc desc"),
    handleValidationErrors,
  ],
  orderController.getOrders
);

/**
 * @route GET /api/orders/:orderId
 * @desc Lấy chi tiết đơn hàng
 * @access Private
 */
router.get(
  "/:orderId",
  [
    param("orderId").isMongoId().withMessage("ID đơn hàng không hợp lệ"),
    handleValidationErrors,
  ],
  orderController.getOrderDetail
);

/**
 * @route GET /api/orders/:orderId/contract
 * @desc Download hợp đồng PDF
 * @access Private (buyer, seller, admin)
 */
router.get(
  "/:orderId/contract",
  [
    param("orderId").isMongoId().withMessage("ID đơn hàng không hợp lệ"),
    handleValidationErrors,
  ],
  orderController.downloadContract
);

/**
 * @route POST /api/orders/:orderId/regenerate-contract
 * @desc Tạo lại hợp đồng (admin only)
 * @access Admin
 */
router.post(
  "/:orderId/regenerate-contract",
  [
    param("orderId").isMongoId().withMessage("ID đơn hàng không hợp lệ"),
    handleValidationErrors,
    authMiddleware.requireAdmin,
  ],
  orderController.regenerateContract
);

module.exports = router;
