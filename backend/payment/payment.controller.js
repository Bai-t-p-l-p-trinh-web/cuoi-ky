const { Payment, PaymentStatus } = require("./payment.model");
const { Order, OrderStatus } = require("../order/order.model");
const { Log, LogType } = require("../log/log.model");
const notificationService = require("../notification/notification.service");

class PaymentController {
  /**
   * Lấy danh sách thanh toán chờ xác minh (cho admin)
   */
  async getPendingPayments(req, res) {
    try {
      const { page = 1, limit = 20, orderCode, paymentCode } = req.query;

      const filter = { status: PaymentStatus.PENDING };

      // Tìm theo mã đơn hàng
      if (orderCode) {
        const order = await Order.findOne({ orderCode });
        if (order) {
          filter.order = order._id;
        }
      }

      // Tìm theo mã thanh toán
      if (paymentCode) {
        filter.paymentCode = { $regex: paymentCode, $options: "i" };
      }

      const payments = await Payment.find(filter)
        .populate({
          path: "order",
          populate: [
            { path: "buyer", select: "fullName email phone" },
            { path: "seller", select: "fullName email phone" },
            { path: "car", select: "title price images" },
          ],
        })
        .populate("user", "fullName email phone")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Payment.countDocuments(filter);

      res.json({
        success: true,
        data: {
          payments,
          pagination: {
            current: parseInt(page),
            total: Math.ceil(total / limit),
            count: payments.length,
            totalRecords: total,
          },
        },
      });
    } catch (error) {
      console.error("Get pending payments error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi lấy danh sách thanh toán",
        error: error.message,
      });
    }
  }

  /**
   * Admin xác minh thanh toán thủ công
   */
  async verifyPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const { bankTransactionId, transactionDate, evidence, notes } = req.body;
      const adminId = req.user.id;

      // Tìm payment
      const payment = await Payment.findById(paymentId).populate("order");

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thanh toán",
        });
      }

      if (payment.status !== PaymentStatus.PENDING) {
        return res.status(400).json({
          success: false,
          message: "Thanh toán đã được xử lý",
        });
      }

      // Cập nhật payment
      payment.status = PaymentStatus.COMPLETED;
      payment.transactionInfo = {
        bankTransactionId,
        transactionDate: transactionDate || new Date(),
        verifiedBy: adminId,
        verifiedAt: new Date(),
        evidence: evidence || [],
      };

      await payment.save();

      // Cập nhật trạng thái đơn hàng
      const order = payment.order;
      let newOrderStatus = order.status;

      if (payment.type === "deposit") {
        newOrderStatus = OrderStatus.DEPOSIT_CONFIRMED;
      } else if (payment.type === "full_payment") {
        newOrderStatus = OrderStatus.PAYMENT_COMPLETED;
      } else if (payment.type === "final_payment") {
        newOrderStatus = OrderStatus.PAYMENT_COMPLETED;
      }

      await Order.findByIdAndUpdate(order._id, {
        status: newOrderStatus,
      });

      // Log hoạt động
      await this.createLog({
        type: LogType.PAYMENT_VERIFIED,
        order: order._id,
        user: adminId,
        action: "verify_payment",
        description: `Admin xác minh thanh toán ${payment.paymentCode}`,
        oldData: { status: PaymentStatus.PENDING },
        newData: {
          status: PaymentStatus.COMPLETED,
          bankTransactionId,
          verifiedBy: adminId,
        },
        notes,
        req,
      });

      // Gửi thông báo
      await notificationService.sendPaymentNotification(payment, "verified");

      res.json({
        success: true,
        message: "Xác minh thanh toán thành công",
        data: {
          payment,
          order: await Order.findById(order._id)
            .populate("buyer", "fullName email")
            .populate("seller", "fullName email")
            .populate("car", "title price"),
        },
      });
    } catch (error) {
      console.error("Verify payment error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi xác minh thanh toán",
        error: error.message,
      });
    }
  }

  /**
   * Admin từ chối thanh toán
   */
  async rejectPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const { reason, notes } = req.body;
      const adminId = req.user.id;

      const payment = await Payment.findById(paymentId).populate("order");

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thanh toán",
        });
      }

      if (payment.status !== PaymentStatus.PENDING) {
        return res.status(400).json({
          success: false,
          message: "Thanh toán đã được xử lý",
        });
      }

      // Cập nhật payment
      payment.status = PaymentStatus.FAILED;
      payment.transactionInfo = {
        verifiedBy: adminId,
        verifiedAt: new Date(),
        rejectionReason: reason,
      };

      await payment.save();

      // Log hoạt động
      await this.createLog({
        type: LogType.PAYMENT_REJECTED,
        order: payment.order._id,
        user: adminId,
        action: "reject_payment",
        description: `Admin từ chối thanh toán ${payment.paymentCode}`,
        oldData: { status: PaymentStatus.PENDING },
        newData: {
          status: PaymentStatus.FAILED,
          rejectionReason: reason,
          verifiedBy: adminId,
        },
        notes,
        req,
      });

      // Gửi thông báo
      await notificationService.sendPaymentNotification(payment, "rejected", {
        reason,
      });

      res.json({
        success: true,
        message: "Đã từ chối thanh toán",
        data: { payment },
      });
    } catch (error) {
      console.error("Reject payment error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi từ chối thanh toán",
        error: error.message,
      });
    }
  }

  /**
   * Lấy chi tiết thanh toán
   */
  async getPaymentDetail(req, res) {
    try {
      const { paymentId } = req.params;

      const payment = await Payment.findById(paymentId)
        .populate({
          path: "order",
          populate: [
            { path: "buyer", select: "fullName email phone" },
            { path: "seller", select: "fullName email phone" },
            { path: "car", select: "title price images" },
          ],
        })
        .populate("user", "fullName email phone")
        .populate("transactionInfo.verifiedBy", "fullName email");

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thanh toán",
        });
      }

      res.json({
        success: true,
        data: { payment },
      });
    } catch (error) {
      console.error("Get payment detail error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi lấy chi tiết thanh toán",
        error: error.message,
      });
    }
  }

  /**
   * Tạo log
   */
  async createLog(logData) {
    try {
      const log = new Log({
        type: logData.type,
        order: logData.order,
        user: logData.user,
        action: logData.action,
        description: logData.description,
        oldData: logData.oldData,
        newData: logData.newData,
        notes: logData.notes,
        ipAddress: logData.req?.ip,
        userAgent: logData.req?.get("User-Agent"),
      });

      await log.save();
      return log;
    } catch (error) {
      console.error("Create log error:", error);
    }
  }
}

module.exports = new PaymentController();
