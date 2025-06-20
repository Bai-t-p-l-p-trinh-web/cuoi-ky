const mongoose = require("mongoose");

const OrderStatus = {
  AWAITING_PAYMENT: "awaiting_payment",
  PAYMENT_RECEIVED: "payment_received", // Admin đã xác nhận nhận tiền
  PENDING_MEETING: "pending_meeting", // Chờ sắp xếp cuộc gặp
  MEETING_SCHEDULED: "meeting_scheduled", // Đã sắp xếp cuộc gặp
  EXCHANGE_IN_PROGRESS: "exchange_in_progress", // Đang trao đổi
  EXCHANGE_COMPLETED: "exchange_completed", // Trao đổi hoàn tất
  AWAITING_FINAL_TRANSFER: "awaiting_final_transfer", // Chờ admin chuyển tiền
  PAID_PARTIAL: "paid_partial",
  PAID_FULL: "paid_full",
  WAITING_CONFIRMATION: "waiting_confirmation",
  NEGOTIATING: "negotiating",
  PENDING_FINAL_PAYMENT: "pending_final_payment",
  DELIVERY_IN_PROGRESS: "delivery_in_progress",
  DELIVERED: "delivered",
  BUYER_CONFIRMED: "buyer_confirmed",
  REFUNDING: "refunding",
  COMPLETED: "completed",
  CANCELLED_BY_BUYER: "cancelled_by_buyer",
  DISPUTED: "disputed",
};

const PaymentMethod = {
  DEPOSIT: "deposit", // Đặt cọc
  FULL_PAYMENT: "full_payment", // Thanh toán toàn bộ
  DIRECT_TRANSACTION: "direct_transaction", // Giao dịch trực tiếp
};

const OrderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      unique: true,
      // Bỏ required để middleware có thể tạo
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.AWAITING_PAYMENT,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    depositAmount: {
      type: Number,
      default: 0,
    },
    remainingAmount: {
      type: Number,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    // Thông tin giao xe
    deliveryInfo: {
      address: String,
      scheduledDate: Date,
      actualDate: Date,
      notes: String,
      images: [String], // URLs ảnh giao xe
      documents: [String], // URLs tài liệu
    },
    // Xác nhận từ buyer và seller
    confirmations: {
      buyerAgreed: {
        type: Boolean,
        default: false,
      },
      buyerAgreedAt: Date,
      sellerConfirmed: {
        type: Boolean,
        default: false,
      },
      sellerConfirmedAt: Date,
      deliveryConfirmed: {
        type: Boolean,
        default: false,
      },
      deliveryConfirmedAt: Date,
    }, // Hợp đồng PDF
    contract: {
      url: String, // Cloudinary URL
      publicId: String, // Cloudinary public ID
      fileName: String,
      generatedAt: Date,
      fileSize: Number,
    },

    // Thời gian nhắc nhở
    reminderSent: {
      type: Boolean,
      default: false,
    },

    // Ghi chú admin
    adminNotes: String,

    // Tranh chấp
    dispute: {
      isDisputed: {
        type: Boolean,
        default: false,
      },
      reason: String,
      evidence: [String],
      resolution: String,
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      resolvedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Tạo orderCode tự động - đảm bảo luôn có orderCode
OrderSchema.pre("save", async function (next) {
  if (!this.orderCode) {
    try {
      const date = new Date();
      const dateStr =
        date.getFullYear().toString() +
        (date.getMonth() + 1).toString().padStart(2, "0") +
        date.getDate().toString().padStart(2, "0");

      // Tìm số thứ tự trong ngày
      const OrderModel = mongoose.model("Order");
      const count = await OrderModel.countDocuments({
        orderCode: { $regex: `^ORD${dateStr}` },
      });

      this.orderCode = `ORD${dateStr}${(count + 1)
        .toString()
        .padStart(3, "0")}`;
      console.log("Generated orderCode:", this.orderCode);
    } catch (error) {
      console.error("Error generating orderCode:", error);
      // Nếu lỗi, tạo orderCode đơn giản
      this.orderCode = `ORD${Date.now()}`;
    }
  }
  next();
});

// Đảm bảo orderCode được tạo trước khi validate
OrderSchema.pre("validate", async function (next) {
  if (!this.orderCode) {
    try {
      const date = new Date();
      const dateStr =
        date.getFullYear().toString() +
        (date.getMonth() + 1).toString().padStart(2, "0") +
        date.getDate().toString().padStart(2, "0");

      const OrderModel = mongoose.model("Order");
      const count = await OrderModel.countDocuments({
        orderCode: { $regex: `^ORD${dateStr}` },
      });

      this.orderCode = `ORD${dateStr}${(count + 1)
        .toString()
        .padStart(3, "0")}`;
    } catch (error) {
      this.orderCode = `ORD${Date.now()}`;
    }
  }
  next();
});

// Index để tối ưu query
OrderSchema.index({ buyer: 1, status: 1 });
OrderSchema.index({ seller: 1, status: 1 });
OrderSchema.index({ createdAt: -1 });

module.exports = {
  Order: mongoose.model("Order", OrderSchema),
  OrderStatus,
  PaymentMethod,
};
