const cron = require("node-cron");
const { Order, OrderStatus } = require("../order/order.model");
const { Log, LogType } = require("../log/log.model");
const notificationService = require("../utils/notificationService");

class OrderReminderService {
  constructor() {
    this.startReminderJobs();
  }

  /**
   * Khởi động các cron jobs
   */
  startReminderJobs() {
    // Chạy mỗi giờ để kiểm tra các đơn hàng cần nhắc nhở
    cron.schedule("0 * * * *", () => {
      this.checkPendingConfirmations();
    }); // Chạy mỗi 6 giờ để kiểm tra payment timeout (ít gắt hơn)
    cron.schedule("0 */6 * * *", () => {
      this.checkExpiredPayments();
    });

    // Chạy hàng ngày để cleanup
    cron.schedule("0 2 * * *", () => {
      this.dailyCleanup();
    });
  }

  /**
   * Kiểm tra các đơn hàng chờ xác nhận quá 48h
   */
  async checkPendingConfirmations() {
    try {
      const cutoffTime = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 giờ trước

      // Tìm đơn hàng đã giao nhưng buyer chưa xác nhận quá 48h
      const pendingOrders = await Order.find({
        status: OrderStatus.DELIVERED,
        "confirmations.deliveryConfirmedAt": { $lt: cutoffTime },
        reminderSent: false,
      }).populate("buyer seller car");

      for (const order of pendingOrders) {
        await this.sendBuyerReminder(order);

        // Đánh dấu đã gửi reminder
        order.reminderSent = true;
        await order.save();

        // Log
        await this.createLog({
          type: LogType.SYSTEM_ACTION,
          order: order._id,
          action: "send_buyer_reminder",
          description: "Hệ thống gửi nhắc nhở buyer xác nhận sau 48h",
        });
      }
    } catch (error) {
      console.error("Check pending confirmations error:", error);
    }
  }
  /**
   * Kiểm tra thanh toán hết hạn (30 ngày)
   */
  async checkExpiredPayments() {
    try {
      const { Payment, PaymentStatus } = require("../payment/payment.model");

      // Tìm thanh toán hết hạn (sau 30 ngày)
      const expiredPayments = await Payment.find({
        status: PaymentStatus.PENDING,
        expiresAt: { $lt: new Date() },
      }).populate("order");

      for (const payment of expiredPayments) {
        // Log chi tiết payment sắp bị hủy
        console.log(
          `Auto-cancelling payment ${payment._id} created at ${payment.createdAt}`
        );

        payment.status = PaymentStatus.CANCELLED;
        await payment.save();

        // Cập nhật trạng thái đơn hàng nếu cần
        const order = await Order.findById(payment.order._id);
        if (order && order.status === OrderStatus.AWAITING_PAYMENT) {
          order.status = OrderStatus.CANCELLED_BY_BUYER;
          await order.save();

          // Log
          await this.createLog({
            type: LogType.SYSTEM_ACTION,
            order: order._id,
            action: "auto_cancel_expired_payment",
            description:
              "Hệ thống tự động hủy đơn hàng do thanh toán hết hạn (30 ngày)",
          });

          // Gửi thông báo
          await notificationService.sendOrderNotification(
            order,
            "auto_cancelled"
          );
        }
      }
    } catch (error) {
      console.error("Check expired payments error:", error);
    }
  }

  /**
   * Dọn dẹp hàng ngày
   */
  async dailyCleanup() {
    try {
      // 1. Dọn dẹp hợp đồng cũ
      const contractService = require("../contract/contract.service");
      await contractService.cleanupOldContracts(30);

      // 2. Dọn dẹp logs cũ (giữ lại 90 ngày)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);

      await Log.deleteMany({
        createdAt: { $lt: cutoffDate },
      });

      // 3. Reset reminder flag cho đơn hàng đã hoàn tất
      await Order.updateMany(
        {
          status: {
            $in: [OrderStatus.COMPLETED, OrderStatus.CANCELLED_BY_BUYER],
          },
          reminderSent: true,
        },
        { reminderSent: false }
      );
    } catch (error) {
      console.error("Daily cleanup error:", error);
    }
  }

  /**
   * Gửi nhắc nhở cho buyer
   */
  async sendBuyerReminder(order) {
    try {
      // Gửi email nhắc nhở
      await notificationService.sendEmail({
        to: order.buyer.email,
        subject: `Nhắc nhở xác nhận đơn hàng ${order.orderCode}`,
        template: "buyer_reminder",
        data: {
          buyerName: order.buyer.fullName,
          orderCode: order.orderCode,
          carName: order.car.name,
          deliveredAt: order.confirmations.deliveryConfirmedAt,
          confirmUrl: `${process.env.CLIENT_URL}/orders/${order._id}/confirm`,
        },
      });

      // Gửi thông báo trong app
      await notificationService.createInAppNotification({
        userId: order.buyer._id,
        title: "Nhắc nhở xác nhận đơn hàng",
        message: `Vui lòng xác nhận đơn hàng ${order.orderCode} đã được giao thành công.`,
        type: "reminder",
        data: {
          orderId: order._id,
          action: "confirm_delivery",
        },
      });

      // Gửi SMS nếu có số điện thoại
      if (order.buyer.phoneNumber) {
        await notificationService.sendSMS({
          to: order.buyer.phoneNumber,
          message: `Nhac nho: Vui long xac nhan don hang ${order.orderCode} da duoc giao thanh cong. Truy cap ${process.env.CLIENT_URL} de xac nhan.`,
        });
      }
    } catch (error) {
      console.error("Send buyer reminder error:", error);
    }
  }

  /**
   * Tự động hoàn tất đơn hàng nếu buyer không phản hồi sau 7 ngày
   */
  async autoCompleteOrders() {
    try {
      const cutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 ngày trước

      const autoCompleteOrders = await Order.find({
        status: OrderStatus.DELIVERED,
        "confirmations.deliveryConfirmedAt": { $lt: cutoffTime },
        reminderSent: true,
      });

      for (const order of autoCompleteOrders) {
        order.status = OrderStatus.COMPLETED;
        order.confirmations.buyerConfirmed = true;
        order.confirmations.buyerConfirmedAt = new Date();
        await order.save();

        // Đánh dấu xe đã bán
        const Car = require("../car/car.model");
        await Car.findByIdAndUpdate(order.car, { sold: true });

        // Log
        await this.createLog({
          type: LogType.SYSTEM_ACTION,
          order: order._id,
          action: "auto_complete_order",
          description:
            "Hệ thống tự động hoàn tất đơn hàng sau 7 ngày không có phản hồi từ buyer",
        });

        // Gửi thông báo
        await notificationService.sendOrderNotification(
          order,
          "auto_completed"
        );
      }
    } catch (error) {
      console.error("Auto complete orders error:", error);
    }
  }

  async createLog({
    type,
    order,
    user,
    action,
    description,
    previousData,
    newData,
  }) {
    try {
      const log = new Log({
        type: type,
        order: order,
        user: user,
        action: action,
        description: description,
        previousData: previousData,
        newData: newData,
      });

      await log.save();
      return log;
    } catch (error) {
      console.error("Create log error:", error);
    }
  }
}

// Export singleton instance
module.exports = new OrderReminderService();
