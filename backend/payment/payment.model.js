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
    },
    // Thông tin thanh toán thực tế
    transactionId: {
      type: String,
    },
    transactionInfo: {
      bankTransactionId: {
        type: String,
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
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

// Tạo paymentCode và transactionId tự động
PaymentSchema.pre("save", async function (next) {
  if (!this.paymentCode) {
    const date = new Date();
    const dateStr =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, "0") +
      date.getDate().toString().padStart(2, "0");

    let isUnique = false;
    let retryCount = 0;
    const maxRetries = 10;

    while (!isUnique && retryCount < maxRetries) {
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      const timeSeq = timestamp.toString().slice(-4);

      this.paymentCode = `PAY${dateStr}${timeSeq}${randomNum}`;

      const existing = await this.constructor.findOne({
        paymentCode: this.paymentCode,
        _id: { $ne: this._id },
      });

      if (!existing) {
        isUnique = true;
      } else {
        retryCount++;
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 10));
      }
    }

    if (!isUnique) {
      throw new Error(
        "Unable to generate unique paymentCode after multiple attempts"
      );
    }
  }

  if (!this.transactionId) {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const date = new Date();
    const dateStr =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, "0") +
      date.getDate().toString().padStart(2, "0");

    this.transactionId = `TXN${dateStr}${timestamp
      .toString()
      .slice(-6)}${randomNum}`;

    let isUnique = false;
    let retryCount = 0;
    const maxRetries = 5;

    while (!isUnique && retryCount < maxRetries) {
      const existing = await this.constructor.findOne({
        transactionId: this.transactionId,
        _id: { $ne: this._id },
      });

      if (!existing) {
        isUnique = true;
      } else {
        const newRandomNum = Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0");
        const newTimestamp = Date.now();
        this.transactionId = `TXN${dateStr}${newTimestamp
          .toString()
          .slice(-6)}${newRandomNum}`;
        retryCount++;
      }
    }

    if (!isUnique) {
      throw new Error(
        "Unable to generate unique transactionId after multiple attempts"
      );
    }
  }

  next();
});

// Index
PaymentSchema.index({ order: 1 });
PaymentSchema.index({ user: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
PaymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });

module.exports = {
  Payment: mongoose.model("Payment", PaymentSchema),
  PaymentStatus,
  PaymentType,
};
