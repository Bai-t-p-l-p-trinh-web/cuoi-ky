const mongoose = require("mongoose");

const NotificationType = {
  // Order notifications
  ORDER_CREATED: "order_created",
  PAYMENT_RECEIVED: "payment_received",
  PAYMENT_CONFIRMED: "payment_confirmed",
  PAYMENT_VERIFIED: "payment_verified",
  PAYMENT_REJECTED: "payment_rejected",
  ORDER_CANCELLED: "order_cancelled",
  DELIVERY_STARTED: "delivery_started",
  DELIVERY_CONFIRMED: "delivery_confirmed",
  ORDER_COMPLETED: "order_completed",

  // Refund notifications
  REFUND_REQUESTED: "refund_requested",
  REFUND_APPROVED: "refund_approved",
  REFUND_REJECTED: "refund_rejected",
  REFUND_COMPLETED: "refund_completed",

  // Chat notifications
  NEW_MESSAGE: "new_message",
  NEW_CHAT: "new_chat",

  // Car notifications
  CAR_APPROVED: "car_approved",
  CAR_REJECTED: "car_rejected",
  CAR_FEATURED: "car_featured",
  CAR_EXPIRED: "car_expired",

  // User notifications
  ACCOUNT_VERIFIED: "account_verified",
  ACCOUNT_SUSPENDED: "account_suspended",
  PASSWORD_CHANGED: "password_changed",

  // System notifications
  MAINTENANCE: "maintenance",
  UPDATE: "update",
  PROMOTION: "promotion",
  REMINDER: "reminder",
  WARNING: "warning",
};

const NotificationPriority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

const NotificationSchema = new mongoose.Schema(
  {
    // Người nhận thông báo
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Người gửi (có thể là system)
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Loại thông báo
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },

    // Tiêu đề
    title: {
      type: String,
      required: true,
      maxLength: 200,
    },

    // Nội dung
    message: {
      type: String,
      required: true,
      maxLength: 1000,
    },

    // Dữ liệu bổ sung
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Độ ưu tiên
    priority: {
      type: String,
      enum: Object.values(NotificationPriority),
      default: NotificationPriority.MEDIUM,
    },

    // Trạng thái
    read: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
    },

    // URL để chuyển đến khi click
    actionUrl: {
      type: String,
    },

    // Button action
    actions: [
      {
        label: String,
        action: String,
        url: String,
        style: {
          type: String,
          enum: ["primary", "secondary", "danger", "success"],
          default: "primary",
        },
      },
    ],

    // Icon/Image
    icon: {
      type: String,
    },

    // Nhóm thông báo (để group lại)
    category: {
      type: String,
      default: "general",
    },

    // Thời gian hết hạn (auto delete)
    expiresAt: {
      type: Date,
    },

    // Metadata
    metadata: {
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
      carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car",
      },
      chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Thread",
      },
      refundId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Refund",
      },
      paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes để tối ưu query
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, type: 1 });
NotificationSchema.index({ recipient: 1, category: 1 });
NotificationSchema.index({ createdAt: 1 }); // Để cleanup
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual để tính toán
NotificationSchema.virtual("isExpired").get(function () {
  return this.expiresAt && new Date() > this.expiresAt;
});

// Static methods
NotificationSchema.statics.createNotification = async function ({
  recipient,
  sender = null,
  type,
  title,
  message,
  data = {},
  priority = NotificationPriority.MEDIUM,
  actionUrl = null,
  actions = [],
  icon = null,
  category = "general",
  expiresAt = null,
  metadata = {},
}) {
  const notification = new this({
    recipient,
    sender,
    type,
    title,
    message,
    data,
    priority,
    actionUrl,
    actions,
    icon,
    category,
    expiresAt,
    metadata,
  });

  return await notification.save();
};

NotificationSchema.statics.markAsRead = async function (
  notificationId,
  userId
) {
  return await this.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    {
      read: true,
      readAt: new Date(),
    },
    { new: true }
  );
};

NotificationSchema.statics.markAllAsRead = async function (
  userId,
  category = null
) {
  const query = { recipient: userId, read: false };
  if (category) {
    query.category = category;
  }

  return await this.updateMany(query, {
    read: true,
    readAt: new Date(),
  });
};

NotificationSchema.statics.getUnreadCount = async function (
  userId,
  category = null
) {
  const query = { recipient: userId, read: false };
  if (category) {
    query.category = category;
  }

  return await this.countDocuments(query);
};

NotificationSchema.statics.cleanupExpired = async function () {
  const cutoffDate = new Date();
  cutoffDate.setDays(cutoffDate.getDate() - 30); // Delete after 30 days

  return await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      {
        read: true,
        createdAt: { $lt: cutoffDate },
      },
    ],
  });
};

module.exports = {
  Notification: mongoose.model("Notification", NotificationSchema),
  NotificationType,
  NotificationPriority,
};
