const mongoose = require("mongoose");

const PaymentStatus = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

const PaymentType = {
  DEPOSIT: "deposit",
  FINAL_PAYMENT: "final_payment",
  FULL_PAYMENT: "full_payment",
};

const PaymentSchema = new mongoose.Schema(
  {
    paymentCode: {
      type: String,
      unique: true,
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(PaymentType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    // Thông tin QR Code
    qrCode: {
      url: String,
      bankCode: String,
      accountNumber: String,
      accountName: String,
      content: String, // Nội dung chuyển khoản
      amount: Number,
    },
    // Thông tin thanh toán thực tế
    transactionInfo: {
      bankTransactionId: String,
      bankCode: String,
      transactionDate: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      verifiedAt: Date,
      evidence: [String], // Ảnh chứng từ thanh toán
    },
    // Webhook data
    webhookData: {
      type: mongoose.Schema.Types.Mixed,
    },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 60 * 1000), // 30 phút
    },
  },
  {
    timestamps: true,
  }
);

// Tạo paymentCode tự động
PaymentSchema.pre("save", async function (next) {
  if (!this.paymentCode) {
    const date = new Date();
    const dateStr =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, "0") +
      date.getDate().toString().padStart(2, "0");

    const count = await this.constructor.countDocuments({
      paymentCode: { $regex: `^PAY${dateStr}` },
    });

    this.paymentCode = `PAY${dateStr}${(count + 1)
      .toString()
      .padStart(4, "0")}`;
  }
  next();
});

// Index
PaymentSchema.index({ order: 1 });
PaymentSchema.index({ user: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = {
  Payment: mongoose.model("Payment", PaymentSchema),
  PaymentStatus,
  PaymentType,
};
