const mongoose = require("mongoose");

const LogType = {
  ORDER_STATUS_CHANGE: "order_status_change",
  PAYMENT_CREATED: "payment_created",
  PAYMENT_COMPLETED: "payment_completed",
  PAYMENT_VERIFIED: "payment_verified",
  PAYMENT_REJECTED: "payment_rejected",
  PAYMENT_CONFIRMED: "payment_confirmed", // Admin xác nhận nhận tiền
  NOTIFICATION_SENT: "notification_sent", // Gửi thông báo
  EXCHANGE_CONFIRMED: "exchange_confirmed", // Xác nhận trao đổi
  PAYMENT_TRANSFERRED: "payment_transferred", // Chuyển tiền cho seller
  REFUND_REQUESTED: "refund_requested",
  REFUND_PROCESSED: "refund_processed",
  CONTRACT_GENERATED: "contract_generated",
  DISPUTE_CREATED: "dispute_created",
  ADMIN_ACTION: "admin_action",
  SYSTEM_ACTION: "system_action",
  CHAT_ROOM_CREATED: "chat_room_created", // Tạo phòng chat
  CHAT_MESSAGE_SENT: "chat_message_sent", // Gửi tin nhắn
};

const LogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(LogType),
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    action: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    // Dữ liệu trước và sau thay đổi
    previousData: {
      type: mongoose.Schema.Types.Mixed,
    },
    newData: {
      type: mongoose.Schema.Types.Mixed,
    },
    // Metadata bổ sung
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

// Index
LogSchema.index({ order: 1, createdAt: -1 });
LogSchema.index({ user: 1, createdAt: -1 });
LogSchema.index({ type: 1, createdAt: -1 });
LogSchema.index({ createdAt: -1 });

module.exports = {
  Log: mongoose.model("Log", LogSchema),
  LogType,
};
