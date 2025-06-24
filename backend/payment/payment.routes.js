const express = require("express");
const router = express.Router();
const paymentController = require("./payment.controller");
const { requireAuth, requireAdmin } = require("../auth/auth.middleware");
const { body, param } = require("express-validator");
const { handleValidationErrors } = require("../validates/validation.helper");

/**
 * User routes - Lịch sử thanh toán
 */

// Lấy lịch sử thanh toán của user
router.get("/history", requireAuth, paymentController.getPaymentHistory);

/**
 * Admin routes - Quản lý thanh toán
 */

// Lấy danh sách thanh toán chờ xác minh
router.get(
  "/pending",
  requireAuth,
  requireAdmin,
  paymentController.getPendingPayments
);

// Lấy danh sách payments theo trạng thái
router.get(
  "/status",
  requireAuth,
  requireAdmin,
  paymentController.getPaymentsByStatus
);

// === PAYMENT FLOW ROUTES ===

// Bước 1: Admin xác nhận đã nhận tiền
router.patch(
  "/:paymentId/admin-confirm",
  [
    param("paymentId").isMongoId().withMessage("Payment ID không hợp lệ"),
    body("notes").optional().isString().withMessage("Ghi chú phải là chuỗi"),
    body("transactionInfo")
      .optional()
      .isObject()
      .withMessage("Thông tin giao dịch phải là object"),
    handleValidationErrors,
  ],
  requireAuth,
  requireAdmin,
  paymentController.adminConfirmPayment
);

// Admin từ chối thanh toán
router.patch(
  "/:paymentId/reject",
  [
    param("paymentId").isMongoId().withMessage("Payment ID không hợp lệ"),
    body("reason").optional().isString().withMessage("Lý do phải là chuỗi"),
    body("notes").optional().isString().withMessage("Ghi chú phải là chuỗi"),
    handleValidationErrors,
  ],
  requireAuth,
  requireAdmin,
  paymentController.rejectPayment
);

// === DEBUG ROUTES (Remove in production) ===

// Debug: Kiểm tra payment info
router.get(
  "/:paymentId/debug",
  [
    param("paymentId").isMongoId().withMessage("Payment ID không hợp lệ"),
    handleValidationErrors,
  ],
  requireAuth,
  requireAdmin,
  paymentController.debugPayment
);

// Bước 2: Thông báo cho buyer và seller
router.post(
  "/:paymentId/notify-users",
  requireAuth,
  requireAdmin,
  paymentController.notifyBuyerSeller
);

// Bước 5: Admin chuyển tiền cho seller
router.post(
  "/:paymentId/transfer-to-seller",
  requireAuth,
  requireAdmin,
  paymentController.transferToSeller
);

// Lấy trạng thái chi tiết của payment flow
router.get(
  "/:paymentId/flow-status",
  requireAuth,
  paymentController.getPaymentFlowStatus
);

// Lấy trạng thái payment flow theo orderId
router.get(
  "/order/:orderId/flow-status",
  requireAuth,
  paymentController.getPaymentFlowByOrder
);

// === ORDER-RELATED FLOW ROUTES ===

// Bước 3: Sắp xếp cuộc gặp (buyer/seller)
router.post(
  "/order/:orderId/schedule-meeting",
  requireAuth,
  paymentController.scheduleMeeting
);

// Bước 4: Xác nhận trao đổi (buyer/seller)
router.post(
  "/order/:orderId/confirm-exchange",
  requireAuth,
  paymentController.confirmExchange
);

// === LEGACY ROUTES ===

// Xác minh thanh toán thủ công
router.patch(
  "/:paymentId/verify",
  requireAuth,
  requireAdmin,
  paymentController.verifyPayment
);

// Từ chối thanh toán
router.patch(
  "/:paymentId/reject",
  requireAuth,
  requireAdmin,
  paymentController.rejectPayment
);

// Lấy chi tiết thanh toán
router.get(
  "/:paymentId",
  requireAuth,
  requireAdmin,
  paymentController.getPaymentDetail
);

module.exports = router;
