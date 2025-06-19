const express = require("express");
const router = express.Router();
const controller = require("./user.controller");
const bankController = require("./user.bank.controller");
const { verifyToken } = require("./user.middleware");
const { validateUpdateInfo } = require("./user.validate");
const authMiddleware = require("../auth/auth.middleware");
const { body, param } = require("express-validator");
const { handleValidationErrors } = require("../validates/validation.helper");

router.get("/me", verifyToken, controller.getInfoMe);

router.patch("/me", verifyToken, validateUpdateInfo, controller.updateInfoMe);

router.post("/logout", verifyToken, controller.LogoutMe);

// Bank info routes
router.get(
  "/bank-info",
  authMiddleware.requireAuth,
  bankController.getBankInfo
);

router.put(
  "/bank-info",
  [
    authMiddleware.requireAuth,
    body("bankName")
      .notEmpty()
      .withMessage("Tên ngân hàng không được để trống"),
    body("bankCode").notEmpty().withMessage("Mã ngân hàng không được để trống"),
    body("accountNumber")
      .notEmpty()
      .withMessage("Số tài khoản không được để trống"),
    body("accountHolder")
      .notEmpty()
      .withMessage("Chủ tài khoản không được để trống"),
    handleValidationErrors,
  ],
  bankController.updateBankInfo
);

// Admin routes
router.get(
  "/pending-bank-verifications",
  [authMiddleware.requireAuth, authMiddleware.requireAdmin],
  bankController.getPendingVerifications
);

router.put(
  "/:userId/verify-bank",
  [
    authMiddleware.requireAuth,
    authMiddleware.requireAdmin,
    param("userId").isMongoId().withMessage("User ID không hợp lệ"),
    body("verified").isBoolean().withMessage("Verified phải là boolean"),
    handleValidationErrors,
  ],
  bankController.verifyBankInfo
);

module.exports = router;
