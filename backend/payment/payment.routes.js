const express = require("express");
const router = express.Router();
const paymentController = require("./payment.controller");
const { requireAuth, requireAdmin } = require("../auth/auth.middleware");

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
