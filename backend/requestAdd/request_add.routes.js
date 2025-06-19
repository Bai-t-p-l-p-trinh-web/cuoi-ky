const express = require("express");
const router = express.Router();
const controller = require("./request_add.controller");
const { verifyToken } = require("../user/user.middleware");
const {
  validateRequest,
  validateCheckedRequest,
  validatePostTheCar,
  validateRejectTheRequest,
  ValidateAddTheInspectors,
} = require("./request_add.validate");

router.post("/", verifyToken, validateRequest, controller.createRequest);

router.get("/", verifyToken, controller.getAllRequestOfUser);

router.patch(
  "/:slugRequest/checked",
  verifyToken,
  validateCheckedRequest,
  controller.checkedTheRequest
);

router.patch(
  "/:slugRequest/reject",
  verifyToken,
  validateRejectTheRequest,
  controller.rejectRequest
);

router.patch(
  "/:slugRequest/done",
  verifyToken,
  validatePostTheCar,
  controller.PostTheCar
);

// nhớ kiểm tra user có phải admin
router.patch(
  "/:slugRequest/employee",
  verifyToken,
  ValidateAddTheInspectors,
  controller.AddTheInspectors
);

router.get('/inspects', verifyToken, controller.getRequestOfStaff);

router.get("/:slugRequest", verifyToken, controller.getRequestBySlug);

router.delete("/:slugRequest", verifyToken, controller.deleteRequest);

module.exports = router;
