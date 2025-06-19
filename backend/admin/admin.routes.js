const express = require("express");
const router = express.Router();
const controller = require("./admin.controller");
const { verifyToken } = require("../user/user.middleware");
const { requireAdmin } = require("../auth/auth.middleware");

// Admin dashboard statistics
router.get(
  "/dashboard/stats",
  verifyToken,
  requireAdmin,
  controller.getDashboardStats
);

// Admin analytics with date range
router.get(
  "/dashboard/analytics",
  verifyToken,
  requireAdmin,
  controller.getAnalytics
);

// User management routes
router.get("/users", verifyToken, requireAdmin, controller.getUsers);
router.get("/users/:id", verifyToken, requireAdmin, controller.getUserDetail);
router.put("/users/:id", verifyToken, requireAdmin, controller.updateUser);
router.delete("/users/:id", verifyToken, requireAdmin, controller.deleteUser);
router.put(
  "/users/:id/status",
  verifyToken,
  requireAdmin,
  controller.updateUserStatus
);
// Bank verification route
router.patch(
  "/users/:userId/verify-bank",
  verifyToken,
  requireAdmin,
  controller.verifyUserBankInfo
);

// Car management routes
router.get("/cars", verifyToken, requireAdmin, controller.getCars);
router.get("/cars/:id", verifyToken, requireAdmin, controller.getCarDetail);
router.put(
  "/cars/:id/status",
  verifyToken,
  requireAdmin,
  controller.updateCarStatus
);
router.delete("/cars/:id", verifyToken, requireAdmin, controller.deleteCar);

// Request management routes
router.get("/requests", verifyToken, requireAdmin, controller.getRequests);
router.get(
  "/requests/:id",
  verifyToken,
  requireAdmin,
  controller.getRequestDetail
);
router.put(
  "/requests/:id/approve",
  verifyToken,
  requireAdmin,
  controller.approveRequest
);
router.put(
  "/requests/:id/reject",
  verifyToken,
  requireAdmin,
  controller.rejectRequest
);
router.put(
  "/requests/:id/assign",
  verifyToken,
  requireAdmin,
  controller.assignInspectors
);

// Inspector routes
router.get("/inspectors", verifyToken, requireAdmin, controller.getInspectors);

// Order management routes
router.get("/orders", verifyToken, requireAdmin, controller.getOrders);
router.get("/orders/:id", verifyToken, requireAdmin, controller.getOrderDetail);
router.put(
  "/orders/:id/status",
  verifyToken,
  requireAdmin,
  controller.updateOrderStatus
);

// Payment management routes
router.get("/payments", verifyToken, requireAdmin, controller.getPayments);
router.get(
  "/payments/:id",
  verifyToken,
  requireAdmin,
  controller.getPaymentDetail
);
router.put(
  "/payments/:id/status",
  verifyToken,
  requireAdmin,
  controller.updatePaymentStatus
);

module.exports = router;
