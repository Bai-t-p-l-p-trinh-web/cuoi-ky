const { Payment, PaymentStatus } = require("../payment/payment.model");
const { Order, OrderStatus } = require("../order/order.model");
const { User } = require("../user/user.model");
const notificationService = require("../notification/notification.service");
const { Log, LogType } = require("../log/log.model");

class PaymentFlowService {
  /**
   * Bước 1: Admin xác nhận đã nhận tiền từ buyer
   */ async adminConfirmPaymentReceived(paymentId, adminId, data) {
    try {
      console.log("=== PAYMENT FLOW SERVICE: adminConfirmPaymentReceived ===");
      console.log("paymentId:", paymentId);
      console.log("adminId:", adminId);
      console.log("data:", data);

      const payment = await Payment.findById(paymentId)
        .populate("order")
        .populate("user", "fullName email phone");

      console.log("Found payment:", payment ? payment._id : "NOT FOUND");
      if (!payment) {
        throw new Error("Payment not found");
      }

      console.log("Payment status:", payment.status);
      if (payment.status !== PaymentStatus.PENDING) {
        throw new Error("Payment is not in pending status");
      }

      // Cập nhật payment
      payment.status = PaymentStatus.ADMIN_CONFIRMED;
      payment.adminConfirmation = {
        confirmedBy: adminId,
        confirmedAt: new Date(),
        notes: data.notes || "",
      };

      // Cập nhật transaction info nếu có
      if (data.transactionInfo) {
        payment.transactionInfo = {
          ...payment.transactionInfo,
          ...data.transactionInfo,
          verifiedBy: adminId,
          verifiedAt: new Date(),
        };
      }

      console.log("Saving payment...");
      await payment.save();

      // Cập nhật order status
      console.log("Updating order:", payment.order._id);
      const order = await Order.findById(payment.order._id);
      order.status = OrderStatus.PAYMENT_RECEIVED;
      await order.save();

      console.log("Creating log...");
      // Log action
      await this.createLog({
        type: LogType.PAYMENT_CONFIRMED,
        userId: adminId,
        orderId: order._id,
        paymentId: payment._id,
        action: "admin_confirm_payment",
        description: `Admin confirmed payment received for order ${order.orderCode}`,
        metadata: { notes: data.notes },
      });

      console.log("Success! Returning result...");
      return {
        success: true,
        payment,
        order,
        message: "Payment confirmed successfully",
      };
    } catch (error) {
      console.error("adminConfirmPaymentReceived error:", error);
      throw new Error(`Failed to confirm payment: ${error.message}`);
    }
  }

  /**
   * Bước 2: Thông báo cho buyer và seller về việc đã nhận tiền
   */
  async notifyBuyerSeller(paymentId, adminId) {
    try {
      const payment = await Payment.findById(paymentId).populate({
        path: "order",
        populate: [
          { path: "buyer", select: "fullName email phone" },
          { path: "seller", select: "fullName email phone" },
          { path: "car", select: "title price" },
        ],
      });

      if (!payment || payment.status !== PaymentStatus.ADMIN_CONFIRMED) {
        throw new Error("Payment not in confirmed status");
      }

      const { order } = payment;

      // Gửi thông báo cho buyer
      await notificationService.createNotification({
        userId: order.buyer._id,
        title: "Thanh toán đã được xác nhận",
        message: `Thanh toán cho đơn hàng ${order.orderCode} đã được xác nhận. Vui lòng liên hệ người bán để trao đổi xe.`,
        type: "payment_confirmed",
        relatedId: order._id,
        relatedModel: "Order",
      });

      // Gửi thông báo cho seller
      await notificationService.createNotification({
        userId: order.seller._id,
        title: "Đã nhận thanh toán từ khách hàng",
        message: `Đã nhận thanh toán cho đơn hàng ${order.orderCode}. Vui lòng liên hệ khách hàng để trao đổi xe.`,
        type: "payment_received",
        relatedId: order._id,
        relatedModel: "Order",
      });

      // Cập nhật payment status
      payment.status = PaymentStatus.BUYER_SELLER_NOTIFIED;
      await payment.save();

      // Cập nhật order status
      order.status = OrderStatus.PENDING_MEETING;
      await order.save(); // Log action
      await this.createLog({
        type: LogType.NOTIFICATION_SENT,
        userId: adminId,
        orderId: order._id,
        paymentId: payment._id,
        action: "notify_users",
        description: `Notified buyer and seller about payment confirmation for order ${order.orderCode}`,
      });

      return {
        success: true,
        message: "Buyer and seller notified successfully",
      };
    } catch (error) {
      throw new Error(`Failed to notify users: ${error.message}`);
    }
  }

  /**
   * Bước 3: Buyer/Seller sắp xếp cuộc gặp
   */
  async scheduleMeeting(orderId, userId, meetingData) {
    try {
      const order = await Order.findById(orderId)
        .populate("buyer", "fullName")
        .populate("seller", "fullName");

      if (!order) {
        throw new Error("Order not found");
      }

      // Kiểm tra user có quyền sắp xếp cuộc gặp
      if (!order.buyer._id.equals(userId) && !order.seller._id.equals(userId)) {
        throw new Error(
          "You are not authorized to schedule meeting for this order"
        );
      }

      const payment = await Payment.findOne({ order: orderId });
      if (!payment || payment.status !== PaymentStatus.BUYER_SELLER_NOTIFIED) {
        throw new Error("Payment not in correct status for meeting scheduling");
      }

      // Cập nhật thông tin cuộc gặp
      payment.exchangeInfo = {
        ...payment.exchangeInfo,
        meetingLocation: meetingData.location,
        meetingTime: new Date(meetingData.time),
        notes: meetingData.notes || "",
      };

      await payment.save();

      // Cập nhật order status
      order.status = OrderStatus.MEETING_SCHEDULED;
      await order.save();

      // Thông báo cho người còn lại
      const otherUserId = order.buyer._id.equals(userId)
        ? order.seller._id
        : order.buyer._id;
      const role = order.buyer._id.equals(userId) ? "buyer" : "seller";

      await notificationService.createNotification({
        userId: otherUserId,
        title: "Cuộc gặp đã được sắp xếp",
        message: `${
          role === "buyer" ? "Khách hàng" : "Người bán"
        } đã sắp xếp cuộc gặp cho đơn hàng ${order.orderCode}. Địa điểm: ${
          meetingData.location
        }, Thời gian: ${new Date(meetingData.time).toLocaleString("vi-VN")}`,
        type: "meeting_scheduled",
        relatedId: order._id,
        relatedModel: "Order",
      });

      return {
        success: true,
        message: "Meeting scheduled successfully",
        meeting: payment.exchangeInfo,
      };
    } catch (error) {
      throw new Error(`Failed to schedule meeting: ${error.message}`);
    }
  }

  /**
   * Bước 4: Buyer/Seller xác nhận trao đổi thành công
   */
  async confirmExchange(orderId, userId, confirmed = true) {
    try {
      const order = await Order.findById(orderId)
        .populate("buyer", "fullName")
        .populate("seller", "fullName");

      if (!order) {
        throw new Error("Order not found");
      }

      // Kiểm tra user có quyền xác nhận
      if (!order.buyer._id.equals(userId) && !order.seller._id.equals(userId)) {
        throw new Error(
          "You are not authorized to confirm exchange for this order"
        );
      }

      const payment = await Payment.findOne({ order: orderId });
      if (!payment) {
        throw new Error("Payment not found");
      }

      const isBuyer = order.buyer._id.equals(userId);
      const role = isBuyer ? "buyer" : "seller";

      // Cập nhật xác nhận
      if (isBuyer) {
        payment.exchangeInfo.buyerConfirmed = confirmed;
        payment.exchangeInfo.buyerConfirmedAt = new Date();
      } else {
        payment.exchangeInfo.sellerConfirmed = confirmed;
        payment.exchangeInfo.sellerConfirmedAt = new Date();
      }

      // Kiểm tra nếu cả hai đều đã xác nhận
      const bothConfirmed =
        payment.exchangeInfo.buyerConfirmed &&
        payment.exchangeInfo.sellerConfirmed;

      if (bothConfirmed) {
        payment.status = PaymentStatus.EXCHANGE_COMPLETED;
        order.status = OrderStatus.EXCHANGE_COMPLETED;

        // Thông báo cho admin
        const admins = await User.find({ role: "admin" });
        for (const admin of admins) {
          await notificationService.createNotification({
            userId: admin._id,
            title: "Trao đổi hoàn tất - Cần chuyển tiền",
            message: `Đơn hàng ${order.orderCode} đã trao đổi thành công. Cần chuyển tiền cho người bán.`,
            type: "exchange_completed",
            relatedId: order._id,
            relatedModel: "Order",
          });
        }

        order.status = OrderStatus.AWAITING_FINAL_TRANSFER;
      } else {
        payment.status = PaymentStatus.EXCHANGE_IN_PROGRESS;
        order.status = OrderStatus.EXCHANGE_IN_PROGRESS;

        // Thông báo cho người còn lại
        const otherUserId = isBuyer ? order.seller._id : order.buyer._id;
        await notificationService.createNotification({
          userId: otherUserId,
          title: "Đối tác đã xác nhận trao đổi",
          message: `${
            role === "buyer" ? "Khách hàng" : "Người bán"
          } đã xác nhận trao đổi thành công cho đơn hàng ${
            order.orderCode
          }. Vui lòng xác nhận.`,
          type: "exchange_confirmation_pending",
          relatedId: order._id,
          relatedModel: "Order",
        });
      }

      await payment.save();
      await order.save(); // Log action
      await this.createLog({
        type: LogType.EXCHANGE_CONFIRMED,
        userId: userId,
        orderId: order._id,
        paymentId: payment._id,
        action: "confirm_exchange",
        description: `${role} confirmed exchange for order ${order.orderCode}`,
        metadata: { confirmed, bothConfirmed },
      });

      return {
        success: true,
        message: bothConfirmed
          ? "Exchange completed, waiting for final transfer"
          : "Exchange confirmation recorded",
        bothConfirmed,
      };
    } catch (error) {
      throw new Error(`Failed to confirm exchange: ${error.message}`);
    }
  }

  /**
   * Bước 5: Admin chuyển tiền cho seller
   */
  async transferToSeller(paymentId, adminId, transferData) {
    try {
      const payment = await Payment.findById(paymentId).populate({
        path: "order",
        populate: [
          { path: "seller", select: "fullName email phone bankAccount" },
          { path: "car", select: "title price" },
        ],
      });

      if (!payment) {
        throw new Error("Payment not found");
      }

      if (payment.status !== PaymentStatus.EXCHANGE_COMPLETED) {
        throw new Error("Exchange not yet completed");
      }

      const { order } = payment;
      const seller = order.seller;

      // Kiểm tra seller có thông tin ngân hàng
      if (!seller.bankAccount || !seller.bankAccount.accountNumber) {
        throw new Error("Seller bank account information not found");
      }

      // Tính toán số tiền chuyển (trừ phí hệ thống nếu có)
      const transferAmount = transferData.amount || payment.amount;

      // Cập nhật thông tin chuyển tiền
      payment.sellerPayout = {
        transferredBy: adminId,
        transferredAt: new Date(),
        transferAmount: transferAmount,
        transferReference: transferData.reference || `TF${Date.now()}`,
        transferEvidence: transferData.evidence || [],
        notes: transferData.notes || "",
      };

      payment.status = PaymentStatus.COMPLETED;
      await payment.save();

      // Cập nhật order
      order.status = OrderStatus.COMPLETED;
      await order.save();

      // Thông báo cho seller
      await notificationService.createNotification({
        userId: seller._id,
        title: "Đã nhận thanh toán",
        message: `Bạn đã nhận được thanh toán ${transferAmount.toLocaleString(
          "vi-VN"
        )}đ cho đơn hàng ${order.orderCode}.`,
        type: "payment_received",
        relatedId: order._id,
        relatedModel: "Order",
      }); // Log action
      await this.createLog({
        type: LogType.PAYMENT_TRANSFERRED,
        userId: adminId,
        orderId: order._id,
        paymentId: payment._id,
        action: "transfer_to_seller",
        description: `Transferred ${transferAmount}đ to seller for order ${order.orderCode}`,
        metadata: {
          transferAmount,
          reference: payment.sellerPayout.transferReference,
          sellerAccount: seller.bankAccount.accountNumber,
        },
      });

      return {
        success: true,
        message: "Payment transferred to seller successfully",
        transfer: payment.sellerPayout,
      };
    } catch (error) {
      throw new Error(`Failed to transfer to seller: ${error.message}`);
    }
  }

  /**
   * Lấy trạng thái chi tiết của payment flow
   */
  async getPaymentFlowStatus(paymentId) {
    try {
      const payment = await Payment.findById(paymentId)
        .populate({
          path: "order",
          populate: [
            { path: "buyer", select: "fullName email phone" },
            { path: "seller", select: "fullName email phone bankAccount" },
            { path: "car", select: "title price images" },
          ],
        })
        .populate("adminConfirmation.confirmedBy", "fullName")
        .populate("sellerPayout.transferredBy", "fullName");

      if (!payment) {
        throw new Error("Payment not found");
      }

      return {
        success: true,
        payment,
        flowSteps: this.getFlowSteps(payment),
      };
    } catch (error) {
      throw new Error(`Failed to get payment flow status: ${error.message}`);
    }
  }
  /**
   * Utility: Tạo log
   */
  async createLog(logData) {
    try {
      const log = new Log({
        type: logData.type,
        order: logData.orderId,
        payment: logData.paymentId,
        user: logData.userId,
        action: logData.action,
        description: logData.description,
        metadata: logData.metadata,
      });
      await log.save();
      return log;
    } catch (error) {
      console.error("Failed to create log:", error);
    }
  }

  /**
   * Utility: Lấy các bước trong flow
   */
  getFlowSteps(payment) {
    const steps = [
      {
        step: 1,
        name: "Chờ admin xác nhận nhận tiền",
        status:
          payment.status === PaymentStatus.PENDING ? "current" : "completed",
        completed: payment.status !== PaymentStatus.PENDING,
        completedAt: payment.adminConfirmation?.confirmedAt,
      },
      {
        step: 2,
        name: "Thông báo buyer và seller",
        status:
          payment.status === PaymentStatus.ADMIN_CONFIRMED
            ? "current"
            : payment.status === PaymentStatus.PENDING
            ? "pending"
            : "completed",
        completed: ![
          PaymentStatus.PENDING,
          PaymentStatus.ADMIN_CONFIRMED,
        ].includes(payment.status),
      },
      {
        step: 3,
        name: "Sắp xếp cuộc gặp",
        status:
          payment.status === PaymentStatus.BUYER_SELLER_NOTIFIED
            ? "current"
            : [PaymentStatus.PENDING, PaymentStatus.ADMIN_CONFIRMED].includes(
                payment.status
              )
            ? "pending"
            : "completed",
        completed: payment.exchangeInfo?.meetingTime ? true : false,
        meetingScheduled: payment.exchangeInfo?.meetingTime,
      },
      {
        step: 4,
        name: "Xác nhận trao đổi",
        status:
          payment.status === PaymentStatus.EXCHANGE_IN_PROGRESS
            ? "current"
            : payment.status === PaymentStatus.EXCHANGE_COMPLETED
            ? "completed"
            : "pending",
        completed: payment.status === PaymentStatus.EXCHANGE_COMPLETED,
        buyerConfirmed: payment.exchangeInfo?.buyerConfirmed,
        sellerConfirmed: payment.exchangeInfo?.sellerConfirmed,
      },
      {
        step: 5,
        name: "Chuyển tiền cho seller",
        status:
          payment.status === PaymentStatus.EXCHANGE_COMPLETED
            ? "current"
            : payment.status === PaymentStatus.COMPLETED
            ? "completed"
            : "pending",
        completed: payment.status === PaymentStatus.COMPLETED,
        completedAt: payment.sellerPayout?.transferredAt,
        transferAmount: payment.sellerPayout?.transferAmount,
      },
    ];

    return steps;
  }
}

module.exports = new PaymentFlowService();
