const {
  Notification,
  NotificationType,
  NotificationPriority,
} = require("./notification.model");
const socketUtils = require("../shared/utils/socket");

class NotificationController {
  /**
   * Tạo thông báo mới
   */
  async createNotification(req, res) {
    try {
      const {
        recipient,
        type,
        title,
        message,
        data = {},
        priority = NotificationPriority.MEDIUM,
        actionUrl,
        actions = [],
        icon,
        category = "general",
        expiresAt,
        metadata = {},
      } = req.body;

      const senderId = req.user?.id;

      // Validate recipient exists
      const User = require("../user/user.model");
      const recipientUser = await User.findById(recipient);
      if (!recipientUser) {
        return res.status(404).json({
          success: false,
          message: "Người nhận không tồn tại",
        });
      }

      // Create notification
      const notification = await Notification.createNotification({
        recipient,
        sender: senderId,
        type,
        title,
        message,
        data,
        priority,
        actionUrl,
        actions,
        icon,
        category,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        metadata,
      }); // Populate sender info
      await notification.populate("sender", "fullName avatar");

      // Send real-time notification via Socket.IO
      try {
        socketUtils.emitToUser(recipient, "notification", notification);
        console.log(`Real-time notification sent to user ${recipient}`);
      } catch (socketError) {
        console.error("Send real-time notification error:", socketError);
      }

      res.status(201).json({
        success: true,
        message: "Thông báo đã được tạo thành công",
        data: notification,
      });
    } catch (error) {
      console.error("Create notification error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi tạo thông báo",
        error: error.message,
      });
    }
  }

  /**
   * Lấy danh sách thông báo của user
   */
  async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      const {
        category,
        type,
        read,
        priority,
        page = 1,
        limit = 20,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      // Build query
      const query = { recipient: userId };

      if (category) query.category = category;
      if (type) query.type = type;
      if (read !== undefined) query.read = read === "true";
      if (priority) query.priority = priority;

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      // Get notifications
      const notifications = await Notification.find(query)
        .populate("sender", "fullName avatar")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Notification.countDocuments(query);
      const unreadCount = await Notification.getUnreadCount(userId, category);

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
          unreadCount,
        },
      });
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi lấy danh sách thông báo",
        error: error.message,
      });
    }
  }

  /**
   * Đánh dấu thông báo đã đọc
   */
  async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      const notification = await Notification.markAsRead(
        notificationId,
        userId
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thông báo",
        });
      } // Send real-time update
      try {
        socketUtils.emitToUser(userId, "notification", {
          type: "notification_read",
          notificationId: notificationId,
        });
        console.log(`Real-time notification update sent to user ${userId}`);
      } catch (socketError) {
        console.error("Send real-time notification error:", socketError);
      }

      res.json({
        success: true,
        message: "Đã đánh dấu thông báo đã đọc",
        data: notification,
      });
    } catch (error) {
      console.error("Mark as read error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi đánh dấu đã đọc",
        error: error.message,
      });
    }
  }

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { category } = req.query;

      const result = await Notification.markAllAsRead(userId, category); // Send real-time update
      try {
        socketUtils.emitToUser(userId, "notification", {
          type: "all_notifications_read",
          category: category || "all",
        });
        console.log(`Real-time notification update sent to user ${userId}`);
      } catch (socketError) {
        console.error("Send real-time notification error:", socketError);
      }

      res.json({
        success: true,
        message: "Đã đánh dấu tất cả thông báo đã đọc",
        data: {
          modifiedCount: result.modifiedCount,
        },
      });
    } catch (error) {
      console.error("Mark all as read error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi đánh dấu tất cả đã đọc",
        error: error.message,
      });
    }
  }

  /**
   * Xóa thông báo
   */
  async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: userId,
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thông báo",
        });
      }

      res.json({
        success: true,
        message: "Đã xóa thông báo thành công",
      });
    } catch (error) {
      console.error("Delete notification error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi xóa thông báo",
        error: error.message,
      });
    }
  }

  /**
   * Lấy số lượng thông báo chưa đọc
   */
  async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;
      const { category } = req.query;

      const count = await Notification.getUnreadCount(userId, category);

      res.json({
        success: true,
        data: {
          unreadCount: count,
        },
      });
    } catch (error) {
      console.error("Get unread count error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi lấy số thông báo chưa đọc",
        error: error.message,
      });
    }
  }

  /**
   * Lấy thống kê thông báo
   */
  async getStatistics(req, res) {
    try {
      const userId = req.user.id;

      const stats = await Notification.aggregate([
        { $match: { recipient: mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: {
              category: "$category",
              read: "$read",
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: "$_id.category",
            total: { $sum: "$count" },
            unread: {
              $sum: {
                $cond: [{ $eq: ["$_id.read", false] }, "$count", 0],
              },
            },
            read: {
              $sum: {
                $cond: [{ $eq: ["$_id.read", true] }, "$count", 0],
              },
            },
          },
        },
      ]);

      res.json({
        success: true,
        data: {
          statistics: stats,
        },
      });
    } catch (error) {
      console.error("Get statistics error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi lấy thống kê thông báo",
        error: error.message,
      });
    }
  }
  /**
   * Gửi thông báo real-time qua Socket.IO
   */
  sendRealTimeNotification(userId, notification) {
    try {
      // Emit to specific user's socket rooms using socket utils
      socketUtils.emitToUser(userId, "notification", notification);
      console.log(`Real-time notification sent to user ${userId}`);
    } catch (error) {
      console.error("Send real-time notification error:", error);
    }
  }

  /**
   * Helper: Tạo thông báo cho đơn hàng
   */
  async createOrderNotification({
    recipientId,
    senderId = null,
    type,
    orderId,
    orderCode,
    title,
    message,
    data = {},
  }) {
    try {
      return await Notification.createNotification({
        recipient: recipientId,
        sender: senderId,
        type: type,
        title: title,
        message: message,
        data: {
          ...data,
          orderCode: orderCode,
        },
        category: "orders",
        actionUrl: `/orders/${orderId}`,
        metadata: {
          orderId: orderId,
        },
        icon: "shopping-cart",
      });
    } catch (error) {
      console.error("Create order notification error:", error);
      return null;
    }
  }

  /**
   * Helper: Tạo thông báo tin nhắn mới
   */
  async createMessageNotification({
    recipientId,
    senderId,
    chatId,
    senderName,
    messagePreview,
  }) {
    try {
      return await Notification.createNotification({
        recipient: recipientId,
        sender: senderId,
        type: NotificationType.NEW_MESSAGE,
        title: `Tin nhắn mới từ ${senderName}`,
        message: messagePreview,
        category: "messages",
        actionUrl: `/chat/${chatId}`,
        metadata: {
          chatId: chatId,
        },
        icon: "message-circle",
        priority: NotificationPriority.HIGH,
      });
    } catch (error) {
      console.error("Create message notification error:", error);
      return null;
    }
  }

  /**
   * Helper: Tạo thông báo về xe
   */
  async createCarNotification({
    recipientId,
    type,
    carId,
    carName,
    title,
    message,
  }) {
    try {
      return await Notification.createNotification({
        recipient: recipientId,
        type: type,
        title: title,
        message: message,
        category: "cars",
        actionUrl: `/cars/${carId}`,
        metadata: {
          carId: carId,
        },
        data: {
          carName: carName,
        },
        icon: "car",
      });
    } catch (error) {
      console.error("Create car notification error:", error);
      return null;
    }
  }
}

module.exports = new NotificationController();
