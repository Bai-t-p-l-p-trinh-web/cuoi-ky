const {
  Notification,
  NotificationType,
  NotificationPriority,
} = require("../notification/notification.model");
const notificationController = require("../notification/notification.controller");
const nodemailer = require("nodemailer");

class NotificationService {
  constructor() {
    this.emailTransporter = this.setupEmailTransporter();
  }

  setupEmailTransporter() {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn(
        "SMTP credentials not configured - email notifications disabled"
      );
      return null;
    }

    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Tạo thông báo đơn hàng
   */
  async createOrderNotification(order, eventType, extraData = {}) {
    try {
      const notifications = [];

      switch (eventType) {
        case "created":
          notifications.push(
            this.createNotificationForUser({
              recipientId: order.seller._id,
              type: NotificationType.ORDER_CREATED,
              title: "Có đơn hàng mới",
              message: `${order.buyer.fullName} muốn mua xe ${order.car.name}`,
              orderId: order._id,
              orderCode: order.orderCode,
              priority: NotificationPriority.HIGH,
            })
          );
          break;

        case "payment_confirmed":
          notifications.push(
            this.createNotificationForUser({
              recipientId: order.seller._id,
              type: NotificationType.PAYMENT_CONFIRMED,
              title: "Thanh toán đã được xác nhận",
              message: `Buyer đã thanh toán ${order.paidAmount.toLocaleString(
                "vi-VN"
              )} VNĐ cho đơn hàng ${order.orderCode}`,
              orderId: order._id,
              orderCode: order.orderCode,
              priority: NotificationPriority.HIGH,
            })
          );
          break;

        case "delivery_started":
          notifications.push(
            this.createNotificationForUser({
              recipientId: order.buyer._id,
              type: NotificationType.DELIVERY_STARTED,
              title: "Bắt đầu giao xe",
              message: `Quá trình giao xe ${order.car.name} đã bắt đầu`,
              orderId: order._id,
              orderCode: order.orderCode,
            }),
            this.createNotificationForUser({
              recipientId: order.seller._id,
              type: NotificationType.DELIVERY_STARTED,
              title: "Bắt đầu giao xe",
              message: `Quá trình giao xe ${order.car.name} cho ${order.buyer.fullName} đã bắt đầu`,
              orderId: order._id,
              orderCode: order.orderCode,
            })
          );
          break;

        case "completed":
          notifications.push(
            this.createNotificationForUser({
              recipientId: order.seller._id,
              type: NotificationType.ORDER_COMPLETED,
              title: "Giao dịch hoàn tất",
              message: `Đơn hàng ${order.orderCode} đã hoàn tất thành công`,
              orderId: order._id,
              orderCode: order.orderCode,
              priority: NotificationPriority.HIGH,
            }),
            this.createNotificationForUser({
              recipientId: order.buyer._id,
              type: NotificationType.ORDER_COMPLETED,
              title: "Giao dịch hoàn tất",
              message: `Bạn đã mua thành công xe ${order.car.name}`,
              orderId: order._id,
              orderCode: order.orderCode,
              priority: NotificationPriority.HIGH,
            })
          );
          break;

        case "cancelled":
          notifications.push(
            this.createNotificationForUser({
              recipientId: order.seller._id,
              type: NotificationType.ORDER_CANCELLED,
              title: "Đơn hàng đã bị hủy",
              message: `${order.buyer.fullName} đã hủy đơn hàng ${order.orderCode}`,
              orderId: order._id,
              orderCode: order.orderCode,
            })
          );
          break;
      }

      await Promise.all(notifications);
      return { success: true };
    } catch (error) {
      console.error("Create order notification error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Tạo thông báo tin nhắn mới
   */
  async createMessageNotification({
    recipientId,
    senderId,
    chatId,
    senderName,
    messagePreview,
  }) {
    try {
      const notification = await this.createNotificationForUser({
        recipientId: recipientId,
        senderId: senderId,
        type: NotificationType.NEW_MESSAGE,
        title: `Tin nhắn mới từ ${senderName}`,
        message:
          messagePreview.length > 100
            ? messagePreview.substring(0, 100) + "..."
            : messagePreview,
        category: "messages",
        actionUrl: `/chat/${chatId}`,
        metadata: { chatId: chatId },
        priority: NotificationPriority.HIGH,
      });

      // Gửi real-time notification
      notificationController.sendRealTimeNotification(
        recipientId,
        notification
      );

      return { success: true, notification };
    } catch (error) {
      console.error("Create message notification error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Tạo thông báo về xe
   */
  async createCarNotification({
    recipientId,
    type,
    carId,
    carName,
    status,
    reason = null,
  }) {
    try {
      let title, message;

      switch (type) {
        case "approved":
          title = "Xe đã được duyệt";
          message = `Xe ${carName} của bạn đã được duyệt và có thể bán`;
          break;
        case "rejected":
          title = "Xe bị từ chối";
          message = `Xe ${carName} của bạn bị từ chối. Lý do: ${
            reason || "Không rõ"
          }`;
          break;
        case "featured":
          title = "Xe được đăng nổi bật";
          message = `Xe ${carName} của bạn đã được đăng nổi bật`;
          break;
        case "expired":
          title = "Tin đăng sắp hết hạn";
          message = `Tin đăng xe ${carName} sẽ hết hạn trong 3 ngày`;
          break;
      }

      const notification = await this.createNotificationForUser({
        recipientId: recipientId,
        type: NotificationType[`CAR_${type.toUpperCase()}`],
        title: title,
        message: message,
        category: "cars",
        actionUrl: `/cars/${carId}`,
        metadata: { carId: carId },
        priority:
          type === "approved"
            ? NotificationPriority.HIGH
            : NotificationPriority.MEDIUM,
      });

      return { success: true, notification };
    } catch (error) {
      console.error("Create car notification error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Tạo thông báo hoàn tiền
   */
  async createRefundNotification(refund, eventType) {
    try {
      const order = refund.order;
      const notifications = [];

      switch (eventType) {
        case "requested":
          notifications.push(
            this.createNotificationForUser({
              recipientId: order.seller._id,
              type: NotificationType.REFUND_REQUESTED,
              title: "Yêu cầu hoàn tiền mới",
              message: `${order.buyer.fullName} yêu cầu hoàn tiền cho đơn hàng ${order.orderCode}`,
              category: "refunds",
              actionUrl: `/refunds/${refund._id}`,
              metadata: { refundId: refund._id, orderId: order._id },
              priority: NotificationPriority.HIGH,
            })
          );
          break;

        case "approved":
          notifications.push(
            this.createNotificationForUser({
              recipientId: refund.requestedBy._id,
              type: NotificationType.REFUND_APPROVED,
              title: "Yêu cầu hoàn tiền được chấp thuận",
              message: `Yêu cầu hoàn tiền ${
                refund.refundCode
              } đã được chấp thuận. Số tiền: ${refund.finalRefundAmount.toLocaleString(
                "vi-VN"
              )} VNĐ`,
              category: "refunds",
              actionUrl: `/refunds/${refund._id}`,
              metadata: { refundId: refund._id },
              priority: NotificationPriority.HIGH,
            })
          );
          break;

        case "rejected":
          notifications.push(
            this.createNotificationForUser({
              recipientId: refund.requestedBy._id,
              type: NotificationType.REFUND_REJECTED,
              title: "Yêu cầu hoàn tiền bị từ chối",
              message: `Yêu cầu hoàn tiền ${refund.refundCode} đã bị từ chối`,
              category: "refunds",
              actionUrl: `/refunds/${refund._id}`,
              metadata: { refundId: refund._id },
              priority: NotificationPriority.HIGH,
            })
          );
          break;
      }

      await Promise.all(notifications);
      return { success: true };
    } catch (error) {
      console.error("Create refund notification error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Tạo thông báo hệ thống
   */
  async createSystemNotification({
    recipientId = null, // null = gửi cho tất cả users
    type,
    title,
    message,
    priority = NotificationPriority.MEDIUM,
    expiresAt = null,
  }) {
    try {
      if (recipientId) {
        // Gửi cho user cụ thể
        const notification = await this.createNotificationForUser({
          recipientId: recipientId,
          type: type,
          title: title,
          message: message,
          category: "system",
          priority: priority,
          expiresAt: expiresAt,
        });
        return { success: true, notification };
      } else {
        // Gửi cho tất cả users (broadcast)
        return await this.broadcastNotification({
          type: type,
          title: title,
          message: message,
          category: "system",
          priority: priority,
          expiresAt: expiresAt,
        });
      }
    } catch (error) {
      console.error("Create system notification error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Gửi thông báo cho tất cả users
   */
  async broadcastNotification(notificationData) {
    try {
      const User = require("../user/user.model");
      const users = await User.find({ status: "active" }).select("_id");

      const notifications = users.map((user) =>
        this.createNotificationForUser({
          recipientId: user._id,
          ...notificationData,
        })
      );

      await Promise.all(notifications);
      return { success: true, count: users.length };
    } catch (error) {
      console.error("Broadcast notification error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Helper: Tạo thông báo cho user cụ thể
   */
  async createNotificationForUser({
    recipientId,
    senderId = null,
    type,
    title,
    message,
    category = "general",
    actionUrl = null,
    metadata = {},
    priority = NotificationPriority.MEDIUM,
    expiresAt = null,
    orderId = null,
    orderCode = null,
  }) {
    try {
      const notificationData = {
        recipient: recipientId,
        sender: senderId,
        type: type,
        title: title,
        message: message,
        category: category,
        actionUrl: actionUrl,
        metadata: metadata,
        priority: priority,
        expiresAt: expiresAt,
      };

      // Thêm dữ liệu đơn hàng nếu có
      if (orderId) {
        notificationData.metadata.orderId = orderId;
        notificationData.actionUrl = actionUrl || `/orders/${orderId}`;
      }

      if (orderCode) {
        notificationData.data = { orderCode: orderCode };
      }

      const notification = await Notification.createNotification(
        notificationData
      );

      // Gửi real-time notification
      notificationController.sendRealTimeNotification(
        recipientId,
        notification
      );

      return notification;
    } catch (error) {
      console.error("Create notification for user error:", error);
      throw error;
    }
  }

  /**
   * Gửi email thông báo
   */
  async sendEmailNotification({ to, subject, template, data }) {
    try {
      if (!this.emailTransporter) {
        console.log(`[EMAIL MOCK] To: ${to}, Subject: ${subject}`);
        return { success: true, mock: true };
      }

      const htmlContent = this.generateEmailTemplate(template, data);

      const info = await this.emailTransporter.sendMail({
        from: `"Car Trading Platform" <${process.env.SMTP_USER}>`,
        to: to,
        subject: subject,
        html: htmlContent,
      });

      console.log(`Email sent: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Send email notification error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cleanup thông báo cũ
   */
  async cleanupNotifications() {
    try {
      const result = await Notification.cleanupExpired();
      console.log(`Cleaned up ${result.deletedCount} old notifications`);
      return result;
    } catch (error) {
      console.error("Cleanup notifications error:", error);
      return null;
    }
  }

  generateEmailTemplate(template, data) {
    const templates = {
      order_notification: `
        <h2>${data.title}</h2>
        <p>${data.message}</p>
        <p><strong>Mã đơn hàng:</strong> ${data.orderCode}</p>
        ${
          data.actionUrl
            ? `<a href="${process.env.CLIENT_URL}${data.actionUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none;">Xem chi tiết</a>`
            : ""
        }
      `,
      message_notification: `
        <h2>Bạn có tin nhắn mới</h2>
        <p><strong>Từ:</strong> ${data.senderName}</p>
        <p><strong>Nội dung:</strong> ${data.messagePreview}</p>
        <a href="${process.env.CLIENT_URL}/chat/${data.chatId}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none;">Xem tin nhắn</a>
      `,
      system_notification: `
        <h2>${data.title}</h2>
        <p>${data.message}</p>
      `,
    };

    return (
      templates[template] || `<h2>${data.title}</h2><p>${data.message}</p>`
    );
  }

  /**
   * Tạo thông báo thanh toán
   */
  async createPaymentNotification(payment, eventType, extraData = {}) {
    try {
      const notifications = [];

      switch (eventType) {
        case "verified":
          notifications.push(
            this.createNotificationForUser({
              recipientId: payment.user._id,
              type: NotificationType.PAYMENT_VERIFIED,
              title: "Thanh toán đã được xác nhận",
              message: `Thanh toán ${payment.paymentCode} đã được admin xác nhận`,
              orderId: payment.order._id,
              paymentCode: payment.paymentCode,
              priority: NotificationPriority.HIGH,
            })
          );
          break;

        case "rejected":
          notifications.push(
            this.createNotificationForUser({
              recipientId: payment.user._id,
              type: NotificationType.PAYMENT_REJECTED,
              title: "Thanh toán bị từ chối",
              message: `Thanh toán ${
                payment.paymentCode
              } đã bị từ chối. Lý do: ${extraData.reason || "Không xác định"}`,
              orderId: payment.order._id,
              paymentCode: payment.paymentCode,
              priority: NotificationPriority.HIGH,
            })
          );
          break;
      }

      // Tạo và gửi tất cả thông báo
      for (const notifData of notifications) {
        await this.createAndSendNotification(notifData);
      }

      return { success: true };
    } catch (error) {
      console.error("Create payment notification error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Gửi thông báo thanh toán (alias method)
   */
  async sendPaymentNotification(payment, eventType, extraData = {}) {
    return await this.createPaymentNotification(payment, eventType, extraData);
  }
}

module.exports = new NotificationService();
