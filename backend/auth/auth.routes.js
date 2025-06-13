const express = require("express");
const router = express.Router();
const controller = require("./auth.controller");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/verify-login-otp", controller.verifyLoginOtp);
router.post("/refresh-token", controller.refreshToken);
router.post("/logout", controller.logout);
router.post("/send-otp", controller.sendOtp);
router.post("/verify-otp", controller.verifyOtp);
router.post("/change-password", controller.changePassword);
router.post("/reset-password", controller.resetPassword);
router.post("/change-email", controller.changeEmail);
router.post("/toggle-2FA", controller.toggle2FA);

module.exports = router;
