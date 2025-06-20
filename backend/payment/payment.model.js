const mongoose = require("mongoose");

const PaymentStatus = {
  PENDING: "pending",
  ADMIN_CONFIRMED: "admin_confirmed", // Admin đã xác nhận nhận tiền
  BUYER_SELLER_NOTIFIED: "buyer_seller_notified", // Đã thông báo cho buyer và seller
  EXCHANGE_IN_PROGRESS: "exchange_in_progress", // Đang trao đổi giữa buyer và seller
  EXCHANGE_COMPLETED: "exchange_completed", // Trao đổi hoàn tất, chờ admin chuyển tiền
  COMPLETED: "completed", // Đã chuyển tiền cho seller
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
      // required: true,
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
    }, // Thông tin thanh toán thực tế
    transactionInfo: {
      bankTransactionId: {
        type: String,
        // unique: true, // TẠM THỜI BỎ UNIQUE ĐỂ TRÁNH LỖI
        sparse: true,
      },
      payerName: String, // Tên người chuyển khoản
      bankCode: String,
      transactionDate: Date,
      transferMessage: String, // Lời nhắn chuyển khoản
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      verifiedAt: Date,
      evidence: [String], // Ảnh chứng từ thanh toán
    },

    // Thông tin admin xác nhận
    adminConfirmation: {
      confirmedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      confirmedAt: Date,
      notes: String, // Ghi chú của admin
    },

    // Thông tin trao đổi giữa buyer và seller
    exchangeInfo: {
      meetingLocation: String,
      meetingTime: Date,
      buyerConfirmed: {
        type: Boolean,
        default: false,
      },
      sellerConfirmed: {
        type: Boolean,
        default: false,
      },
      buyerConfirmedAt: Date,
      sellerConfirmedAt: Date,
      notes: String,
    },

    // Thông tin chuyển tiền cho seller
    sellerPayout: {
      transferredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      transferredAt: Date,
      transferAmount: Number,
      transferReference: String, // Mã tham chiếu chuyển khoản
      transferEvidence: [String], // Ảnh chứng từ chuyển khoản
      notes: String,
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
