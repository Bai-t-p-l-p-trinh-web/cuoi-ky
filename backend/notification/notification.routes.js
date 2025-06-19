const express = require("express");
const router = express.Router();
const notificationController = require("./notification.controller");
const authMiddleware = require("../auth/auth.middleware");
const { body, param, query } = require("express-validator");
const { handleValidationErrors } = require("../validates/validation.helper");

// Middleware xác thực cho tất cả routes
router.use(authMiddleware.requireAuth);

/**
 * @route POST /api/notifications
 * @desc Tạo thông báo mới (Admin hoặc System)
 * @access Private
 */
router.post(
  "/",
  [
    body("recipient")
      .notEmpty()
      .withMessage("Người nhận không được để trống")
      .isMongoId()
      .withMessage("ID người nhận không hợp lệ"),
    body("type")
      .notEmpty()
      .withMessage("Loại thông báo không được để trống")
      .isIn([
        "order_created",
        "payment_received",
        "payment_confirmed",
        "order_cancelled",
        "delivery_started",
        "delivery_confirmed",
        "order_completed",
        "refund_requested",
        "refund_approved",
        "refund_rejected",
        "refund_completed",
        "new_message",
        "new_chat",
        "car_approved",
        "car_rejected",
        "car_featured",
        "car_expired",
        "account_verified",
        "account_suspended",
        "password_changed",
        "maintenance",
        "update",
        "promotion",
        "reminder",
        "warning",
      ])
      .withMessage("Loại thông báo không hợp lệ"),
    body("title")
      .notEmpty()
      .withMessage("Tiêu đề không được để trống")
      .isLength({ max: 200 })
      .withMessage("Tiêu đề không được quá 200 ký tự"),
    body("message")
      .notEmpty()
      .withMessage("Nội dung không được để trống")
      .isLength({ max: 1000 })
      .withMessage("Nội dung không được quá 1000 ký tự"),
    body("priority")
      .optional()
      .isIn(["low", "medium", "high", "urgent"])
      .withMessage("Độ ưu tiên không hợp lệ"),
    body("category")
      .optional()
      .isLength({ max: 50 })
      .withMessage("Danh mục không được quá 50 ký tự"),
    body("actionUrl")
      .optional()
      .isURL()
      .withMessage("URL hành động không hợp lệ"),
    body("expiresAt")
      .optional()
      .isISO8601()
      .withMessage("Thời gian hết hạn không hợp lệ"),
    handleValidationErrors,
  ],
  notificationController.createNotification
);

/**
 * @route GET /api/notifications
 * @desc Lấy danh sách thông báo của user
 * @access Private
 */
router.get(
  "/",
  [
    query("category")
      .optional()
      .isLength({ max: 50 })
      .withMessage("Danh mục không hợp lệ"),
    query("type")
      .optional()
      .isIn([
        "order_created",
        "payment_received",
        "payment_confirmed",
        "order_cancelled",
        "delivery_started",
        "delivery_confirmed",
        "order_completed",
        "refund_requested",
        "refund_approved",
        "refund_rejected",
        "refund_completed",
        "new_message",
        "new_chat",
        "car_approved",
        "car_rejected",
        "car_featured",
        "car_expired",
        "account_verified",
        "account_suspended",
        "password_changed",
        "maintenance",
        "update",
        "promotion",
        "reminder",
        "warning",
      ])
      .withMessage("Loại thông báo không hợp lệ"),
    query("read")
      .optional()
      .isBoolean()
      .withMessage("Trạng thái đọc phải là boolean"),
    query("priority")
      .optional()
      .isIn(["low", "medium", "high", "urgent"])
      .withMessage("Độ ưu tiên không hợp lệ"),
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
      .isIn(["createdAt", "updatedAt", "priority"])
      .withMessage("SortBy không hợp lệ"),
    query("sortOrder")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("SortOrder phải là asc hoặc desc"),
    handleValidationErrors,
  ],
  notificationController.getNotifications
);

/**
 * @route PUT /api/notifications/:notificationId/read
 * @desc Đánh dấu thông báo đã đọc
 * @access Private
 */
router.put(
  "/:notificationId/read",
  [
    param("notificationId")
      .isMongoId()
      .withMessage("ID thông báo không hợp lệ"),
    handleValidationErrors,
  ],
  notificationController.markAsRead
);

/**
 * @route PUT /api/notifications/mark-all-read
 * @desc Đánh dấu tất cả thông báo đã đọc
 * @access Private
 */
router.put(
  "/mark-all-read",
  [
    query("category")
      .optional()
      .isLength({ max: 50 })
      .withMessage("Danh mục không hợp lệ"),
    handleValidationErrors,
  ],
  notificationController.markAllAsRead
);

/**
 * @route DELETE /api/notifications/:notificationId
 * @desc Xóa thông báo
 * @access Private
 */
router.delete(
  "/:notificationId",
  [
    param("notificationId")
      .isMongoId()
      .withMessage("ID thông báo không hợp lệ"),
    handleValidationErrors,
  ],
  notificationController.deleteNotification
);

/**
 * @route GET /api/notifications/unread-count
 * @desc Lấy số lượng thông báo chưa đọc
 * @access Private
 */
router.get(
  "/unread-count",
  [
    query("category")
      .optional()
      .isLength({ max: 50 })
      .withMessage("Danh mục không hợp lệ"),
    handleValidationErrors,
  ],
  notificationController.getUnreadCount
);

/**
 * @route GET /api/notifications/statistics
 * @desc Lấy thống kê thông báo
 * @access Private
 */
router.get("/statistics", notificationController.getStatistics);

module.exports = router;
