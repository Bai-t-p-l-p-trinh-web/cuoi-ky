const mongoose = require("mongoose");

const RefundStatus = {
  REQUESTED: "requested",
  PROCESSING: "processing",
  APPROVED: "approved",
  REJECTED: "rejected",
  COMPLETED: "completed",
};

const RefundReason = {
  BUYER_CHANGED_MIND: "buyer_changed_mind",
  CAR_NOT_AS_DESCRIBED: "car_not_as_described",
  SELLER_FRAUD: "seller_fraud",
  DELIVERY_FAILED: "delivery_failed",
  OTHER: "other",
};

const RefundSchema = new mongoose.Schema(
  {
    refundCode: {
      type: String,
      unique: true,
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: Object.values(RefundReason),
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    requestedAmount: {
      type: Number,
      required: true,
    },
    // Các khoản trừ
    deductions: {
      serviceFee: {
        type: Number,
        default: 0,
      },
      shippingFee: {
        type: Number,
        default: 0,
      },
      damageFee: {
        type: Number,
        default: 0,
      },
      otherFees: {
        type: Number,
        default: 0,
      },
      description: String,
    },
    finalRefundAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(RefundStatus),
      default: RefundStatus.REQUESTED,
    },
    // Bằng chứng từ buyer
    evidence: [String], // URLs ảnh/video

    // Phản hồi từ seller
    sellerResponse: {
      agreed: Boolean,
      reason: String,
      evidence: [String],
      respondedAt: Date,
    },

    // Xác nhận seller đã nhận lại xe (nếu cần)
    carReturnConfirmed: {
      type: Boolean,
      default: false,
    },
    carReturnConfirmedAt: Date,
    carReturnEvidence: [String],

    // Xử lý bởi admin
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    processedAt: Date,
    adminNotes: String,
    // Thông tin chuyển khoản hoàn tiền
    refundTransaction: {
      // Thông tin ngân hàng người nhận tiền hoàn
      bankName: String,
      bankCode: String,
      accountNumber: String,
      accountHolder: String,
      // Thông tin giao dịch
      transactionId: String,
      amount: Number,
      completedAt: Date,
      evidence: [String], // Ảnh chứng từ chuyển khoản
    },
  },
  {
    timestamps: true,
  }
);

// Tạo refundCode tự động
RefundSchema.pre("save", async function (next) {
  if (!this.refundCode) {
    const date = new Date();
    const dateStr =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, "0") +
      date.getDate().toString().padStart(2, "0");

    const count = await this.constructor.countDocuments({
      refundCode: { $regex: `^REF${dateStr}` },
    });

    this.refundCode = `REF${dateStr}${(count + 1).toString().padStart(3, "0")}`;
  }
  next();
});

// Index
RefundSchema.index({ order: 1 });
RefundSchema.index({ requestedBy: 1 });
RefundSchema.index({ status: 1 });
RefundSchema.index({ createdAt: -1 });

module.exports = {
  Refund: mongoose.model("Refund", RefundSchema),
  RefundStatus,
  RefundReason,
};
