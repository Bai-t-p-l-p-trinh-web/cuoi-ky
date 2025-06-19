const { Order, OrderStatus, PaymentMethod } = require("./order.model");
const {
  Payment,
  PaymentStatus,
  PaymentType,
} = require("../payment/payment.model");
const { Log, LogType } = require("../log/log.model");
const vietQRService = require("../payment/vietqr.service");
const contractService = require("../contract/contract.service");
const notificationService = require("../utils/notificationService");
const Car = require("../car/car.model");
const User = require("../user/user.model");

class OrderController {
  /**
   * Tạo đơn hàng mới
   */ async createOrder(req, res) {
    try {
      const { carId, paymentMethod, depositPercentage = 20 } = req.body;
      const buyerId = req.user.id || req.user._id || req.user.userId;

      console.log("Create order - buyerId:", buyerId);
      console.log("Create order - carId:", carId);
      console.log("Create order - req.user:", req.user); // Kiểm tra xe tồn tại và chưa bán
      const car = await Car.findOne({
        _id: carId,
        status: { $ne: "sold" },
      });

      console.log(car);

      if (!car) {
        return res.status(404).json({
          success: false,
          message: "Xe không tồn tại hoặc đã được bán",
        });
      } // Lấy thông tin seller riêng
      const seller = await User.findById(car.sellerId);

      if (!seller) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thông tin người bán",
        });
      } // Kiểm tra thông tin ngân hàng của seller nếu không phải giao dịch trực tiếp
      if (paymentMethod !== PaymentMethod.DIRECT_TRANSACTION) {
        if (
          !seller.bankInfo ||
          !seller.bankInfo.accountNumber ||
          !seller.bankInfo.isVerified
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Người bán chưa cập nhật hoặc chưa xác minh thông tin ngân hàng. Vui lòng liên hệ người bán hoặc chọn phương thức giao dịch trực tiếp.",
            sellerBankNotConfigured: true,
          });
        }
      } // Không cho phép tự mua xe của mình
      if (seller._id.toString() === buyerId) {
        return res.status(400).json({
          success: false,
          message: "Bạn không thể mua xe của chính mình",
        });
      }

      // Tính toán số tiền
      const totalAmount = car.price;
      let depositAmount = 0;
      let remainingAmount = totalAmount;

      if (paymentMethod === PaymentMethod.DEPOSIT) {
        depositAmount = Math.round(totalAmount * (depositPercentage / 100));
        remainingAmount = totalAmount - depositAmount;
      } // Tạo đơn hàng
      const order = new Order({
        buyer: buyerId,
        seller: seller._id,
        car: carId,
        paymentMethod: paymentMethod,
        totalAmount: totalAmount,
        depositAmount: depositAmount,
        remainingAmount: remainingAmount,
        status:
          paymentMethod === PaymentMethod.DIRECT_TRANSACTION
            ? OrderStatus.PENDING_MEETING
            : OrderStatus.AWAITING_PAYMENT,
      });

      await order.save();

      // Log tạo đơn hàng
      await this.createLog({
        type: LogType.ORDER_STATUS_CHANGE,
        order: order._id,
        user: buyerId,
        action: "create_order",
        description: `Tạo đơn hàng ${order.orderCode}`,
        newData: { status: order.status, paymentMethod: paymentMethod },
        req: req,
      });

      // Nếu là giao dịch trực tiếp, gửi thông báo và kết thúc
      if (paymentMethod === PaymentMethod.DIRECT_TRANSACTION) {
        await notificationService.sendOrderNotification(
          order,
          "created_direct"
        );

        return res.status(201).json({
          success: true,
          message:
            "Đơn hàng đã được tạo. Vui lòng liên hệ người bán để thống nhất giao dịch.",
          data: {
            order: await this.populateOrder(order),
            nextStep: "contact_seller",
          },
        });
      }

      // Tạo QR thanh toán cho đặt cọc hoặc thanh toán toàn bộ
      const paymentAmount =
        paymentMethod === PaymentMethod.DEPOSIT ? depositAmount : totalAmount;
      const paymentType =
        paymentMethod === PaymentMethod.DEPOSIT
          ? PaymentType.DEPOSIT
          : PaymentType.FULL_PAYMENT;

      const qrResult = await vietQRService.generateOrderQR(
        order,
        paymentAmount,
        paymentType.replace("_payment", "")
      );

      if (!qrResult.success) {
        return res.status(500).json({
          success: false,
          message: "Không thể tạo QR thanh toán",
          error: qrResult.error,
        });
      }

      // Tạo payment record
      const payment = new Payment({
        order: order._id,
        user: buyerId,
        amount: paymentAmount,
        type: paymentType,
        qrCode: qrResult.data,
      });

      await payment.save();

      // Log tạo thanh toán
      await this.createLog({
        type: LogType.PAYMENT_CREATED,
        order: order._id,
        user: buyerId,
        action: "create_payment",
        description: `Tạo QR thanh toán ${payment.paymentCode}`,
        newData: { paymentCode: payment.paymentCode, amount: paymentAmount },
        req: req,
      });

      res.status(201).json({
        success: true,
        message: "Đơn hàng đã được tạo thành công",
        data: {
          order: await this.populateOrder(order),
          payment: payment,
          qrCode: qrResult.data,
          nextStep: "payment",
        },
      });
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi tạo đơn hàng",
        error: error.message,
      });
    }
  }

  /**
   * Xác nhận thanh toán
   */
  async confirmPayment(req, res) {
    try {
      const { paymentId, transactionId, evidence } = req.body;
      const userId = req.user.id;

      const payment = await Payment.findById(paymentId).populate("order");
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thông tin thanh toán",
        });
      }

      // Kiểm tra quyền
      if (payment.user.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xác nhận thanh toán này",
        });
      }

      if (payment.status !== PaymentStatus.PENDING) {
        return res.status(400).json({
          success: false,
          message: "Thanh toán đã được xử lý",
        });
      }

      // Cập nhật thông tin thanh toán
      payment.transactionInfo = {
        bankTransactionId: transactionId,
        transactionDate: new Date(),
        evidence: evidence || [],
      };
      payment.status = PaymentStatus.COMPLETED;
      await payment.save();

      // Cập nhật đơn hàng
      const order = payment.order;
      order.paidAmount += payment.amount;

      if (payment.type === PaymentType.DEPOSIT) {
        order.status = OrderStatus.PAID_PARTIAL;
      } else if (payment.type === PaymentType.FULL_PAYMENT) {
        order.status = OrderStatus.PAID_FULL;
      } else if (payment.type === PaymentType.FINAL_PAYMENT) {
        order.status = OrderStatus.PAID_FULL;
      }

      await order.save(); // Tạo hợp đồng PDF
      if (
        order.status === OrderStatus.PAID_FULL ||
        order.status === OrderStatus.PAID_PARTIAL
      ) {
        const contractResult = await contractService.generateContract(
          await this.populateOrder(order),
          payment
        );

        if (contractResult.success) {
          order.contract = {
            url: contractResult.cloudinaryUrl,
            publicId: contractResult.cloudinaryPublicId,
            fileName: contractResult.fileName,
            generatedAt: new Date(),
            fileSize: contractResult.fileSize,
          };
          await order.save();

          // Log tạo hợp đồng
          await this.createLog({
            type: LogType.CONTRACT_GENERATED,
            order: order._id,
            user: userId,
            action: "generate_contract",
            description: `Tạo hợp đồng ${contractResult.fileName}`,
            newData: { contractUrl: contractResult.cloudinaryUrl },
            req: req,
          });
        }
      }

      // Log
      await this.createLog({
        type: LogType.PAYMENT_COMPLETED,
        order: order._id,
        user: userId,
        action: "confirm_payment",
        description: `Xác nhận thanh toán ${payment.paymentCode}`,
        newData: {
          paymentStatus: payment.status,
          orderStatus: order.status,
          paidAmount: order.paidAmount,
        },
        req: req,
      });

      // Gửi thông báo
      await notificationService.sendOrderNotification(
        order,
        "payment_confirmed"
      );

      res.json({
        success: true,
        message: "Xác nhận thanh toán thành công",
        data: {
          order: await this.populateOrder(order),
          payment: payment,
          nextStep:
            order.status === OrderStatus.PAID_PARTIAL
              ? "negotiate_delivery"
              : "wait_seller_confirmation",
        },
      });
    } catch (error) {
      console.error("Confirm payment error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi xác nhận thanh toán",
        error: error.message,
      });
    }
  }

  /**
   * Buyer xác nhận đã thống nhất với seller
   */
  async buyerConfirmAgreement(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }

      if (order.buyer.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền thực hiện thao tác này",
        });
      }

      if (
        ![OrderStatus.PAID_PARTIAL, OrderStatus.PAID_FULL].includes(
          order.status
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Đơn hàng chưa ở trạng thái phù hợp",
        });
      }

      // Cập nhật xác nhận buyer
      order.confirmations.buyerAgreed = true;
      order.confirmations.buyerAgreedAt = new Date();

      // Nếu đã đặt cọc, chuyển sang chờ thanh toán cuối
      if (order.status === OrderStatus.PAID_PARTIAL) {
        order.status = OrderStatus.PENDING_FINAL_PAYMENT;
      } else {
        order.status = OrderStatus.WAITING_CONFIRMATION;
      }

      await order.save();

      // Log
      await this.createLog({
        type: LogType.ORDER_STATUS_CHANGE,
        order: order._id,
        user: userId,
        action: "buyer_confirm_agreement",
        description: "Buyer xác nhận đã thống nhất điều kiện giao dịch",
        newData: { status: order.status },
        req: req,
      });

      // Gửi thông báo
      await notificationService.sendOrderNotification(order, "buyer_agreed");

      res.json({
        success: true,
        message: "Đã xác nhận thống nhất thành công",
        data: {
          order: await this.populateOrder(order),
          nextStep:
            order.status === OrderStatus.PENDING_FINAL_PAYMENT
              ? "final_payment"
              : "wait_delivery",
        },
      });
    } catch (error) {
      console.error("Buyer confirm agreement error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi xác nhận thống nhất",
        error: error.message,
      });
    }
  }

  /**
   * Tạo QR thanh toán cuối (cho trường hợp đặt cọc)
   */
  async createFinalPayment(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }

      if (order.buyer.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền thực hiện thao tác này",
        });
      }

      if (order.status !== OrderStatus.PENDING_FINAL_PAYMENT) {
        return res.status(400).json({
          success: false,
          message: "Đơn hàng không ở trạng thái chờ thanh toán cuối",
        });
      }

      // Tạo QR thanh toán phần còn lại
      const qrResult = await vietQRService.generateOrderQR(
        order,
        order.remainingAmount,
        "final_payment"
      );

      if (!qrResult.success) {
        return res.status(500).json({
          success: false,
          message: "Không thể tạo QR thanh toán",
          error: qrResult.error,
        });
      }

      // Tạo payment record
      const payment = new Payment({
        order: order._id,
        user: userId,
        amount: order.remainingAmount,
        type: PaymentType.FINAL_PAYMENT,
        qrCode: qrResult.data,
      });

      await payment.save();

      // Log
      await this.createLog({
        type: LogType.PAYMENT_CREATED,
        order: order._id,
        user: userId,
        action: "create_final_payment",
        description: `Tạo QR thanh toán cuối ${payment.paymentCode}`,
        newData: {
          paymentCode: payment.paymentCode,
          amount: order.remainingAmount,
        },
        req: req,
      });

      res.json({
        success: true,
        message: "Đã tạo QR thanh toán cuối thành công",
        data: {
          payment: payment,
          qrCode: qrResult.data,
          nextStep: "final_payment",
        },
      });
    } catch (error) {
      console.error("Create final payment error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi tạo thanh toán cuối",
        error: error.message,
      });
    }
  }

  /**
   * Bắt đầu giao xe
   */
  async startDelivery(req, res) {
    try {
      const { orderId } = req.params;
      const { deliveryInfo } = req.body;
      const userId = req.user.id;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }

      // Chỉ seller hoặc buyer mới có thể bắt đầu giao xe
      if (![order.seller.toString(), order.buyer.toString()].includes(userId)) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền thực hiện thao tác này",
        });
      }

      if (order.status !== OrderStatus.WAITING_CONFIRMATION) {
        return res.status(400).json({
          success: false,
          message: "Đơn hàng chưa ở trạng thái phù hợp để giao xe",
        });
      }

      // Cập nhật thông tin giao xe
      order.deliveryInfo = {
        ...order.deliveryInfo,
        ...deliveryInfo,
        actualDate: new Date(),
      };
      order.status = OrderStatus.DELIVERY_IN_PROGRESS;
      await order.save();

      // Log
      await this.createLog({
        type: LogType.ORDER_STATUS_CHANGE,
        order: order._id,
        user: userId,
        action: "start_delivery",
        description: "Bắt đầu quá trình giao xe",
        newData: { status: order.status, deliveryInfo: deliveryInfo },
        req: req,
      });

      // Gửi thông báo
      await notificationService.sendOrderNotification(
        order,
        "delivery_started"
      );

      res.json({
        success: true,
        message: "Đã bắt đầu quá trình giao xe",
        data: {
          order: await this.populateOrder(order),
          nextStep: "confirm_delivery",
        },
      });
    } catch (error) {
      console.error("Start delivery error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi bắt đầu giao xe",
        error: error.message,
      });
    }
  }

  /**
   * Xác nhận đã giao/nhận xe
   */
  async confirmDelivery(req, res) {
    try {
      const { orderId } = req.params;
      const { images, documents, notes } = req.body;
      const userId = req.user.id;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }

      if (![order.seller.toString(), order.buyer.toString()].includes(userId)) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền thực hiện thao tác này",
        });
      }

      if (order.status !== OrderStatus.DELIVERY_IN_PROGRESS) {
        return res.status(400).json({
          success: false,
          message: "Đơn hàng không ở trạng thái giao xe",
        });
      }

      // Cập nhật thông tin giao xe
      order.deliveryInfo.images = [
        ...(order.deliveryInfo.images || []),
        ...(images || []),
      ];
      order.deliveryInfo.documents = [
        ...(order.deliveryInfo.documents || []),
        ...(documents || []),
      ];
      order.deliveryInfo.notes = notes || order.deliveryInfo.notes;

      order.confirmations.deliveryConfirmed = true;
      order.confirmations.deliveryConfirmedAt = new Date();
      order.status = OrderStatus.DELIVERED;

      await order.save();

      // Log
      await this.createLog({
        type: LogType.ORDER_STATUS_CHANGE,
        order: order._id,
        user: userId,
        action: "confirm_delivery",
        description: "Xác nhận đã giao/nhận xe",
        newData: { status: order.status },
        req: req,
      });

      // Gửi thông báo
      await notificationService.sendOrderNotification(
        order,
        "delivery_confirmed"
      );

      res.json({
        success: true,
        message: "Đã xác nhận giao xe thành công",
        data: {
          order: await this.populateOrder(order),
          nextStep: "buyer_final_confirmation",
        },
      });
    } catch (error) {
      console.error("Confirm delivery error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi xác nhận giao xe",
        error: error.message,
      });
    }
  }

  /**
   * Buyer xác nhận hài lòng và hoàn tất giao dịch
   */
  async buyerFinalConfirmation(req, res) {
    try {
      const { orderId } = req.params;
      const { satisfied, notes } = req.body;
      const userId = req.user.id;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }

      if (order.buyer.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Chỉ buyer mới có thể thực hiện thao tác này",
        });
      }

      if (order.status !== OrderStatus.DELIVERED) {
        return res.status(400).json({
          success: false,
          message: "Đơn hàng chưa ở trạng thái đã giao xe",
        });
      }

      if (satisfied) {
        // Buyer hài lòng -> Hoàn tất giao dịch
        order.status = OrderStatus.COMPLETED;
        order.confirmations.buyerConfirmed = true;
        order.confirmations.buyerConfirmedAt = new Date();

        // Đánh dấu xe đã bán
        const Car = require("../car/car.model");
        await Car.findByIdAndUpdate(order.car, { sold: true });

        await order.save();

        // Log
        await this.createLog({
          type: LogType.ORDER_STATUS_CHANGE,
          order: order._id,
          user: userId,
          action: "buyer_satisfied",
          description: "Buyer xác nhận hài lòng và hoàn tất giao dịch",
          newData: { status: order.status, notes: notes },
          req: req,
        });

        // Gửi thông báo
        await notificationService.sendOrderNotification(
          order,
          "transaction_completed"
        );

        res.json({
          success: true,
          message: "Giao dịch đã hoàn tất thành công",
          data: {
            order: await this.populateOrder(order),
            nextStep: "completed",
          },
        });
      } else {
        // Buyer không hài lòng -> Chuyển sang refund
        order.status = OrderStatus.REFUNDING;
        await order.save();

        // Tự động tạo refund request
        const { Refund, RefundReason } = require("../refund/refund.model");
        const refund = new Refund({
          order: order._id,
          requestedBy: userId,
          reason: RefundReason.CAR_NOT_AS_DESCRIBED,
          description: notes || "Buyer không hài lòng với xe nhận được",
          requestedAmount: order.paidAmount,
        });

        await refund.save();

        // Log
        await this.createLog({
          type: LogType.REFUND_REQUESTED,
          order: order._id,
          user: userId,
          action: "request_refund",
          description: "Buyer yêu cầu hoàn tiền do không hài lòng",
          newData: {
            status: order.status,
            refundCode: refund.refundCode,
            notes: notes,
          },
          req: req,
        });

        // Gửi thông báo
        await notificationService.sendOrderNotification(
          order,
          "refund_requested"
        );

        res.json({
          success: true,
          message: "Đã gửi yêu cầu hoàn tiền",
          data: {
            order: await this.populateOrder(order),
            refund: refund,
            nextStep: "wait_refund_processing",
          },
        });
      }
    } catch (error) {
      console.error("Buyer final confirmation error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi xác nhận cuối từ buyer",
        error: error.message,
      });
    }
  }

  /**
   * Hủy đơn hàng (chỉ buyer có thể hủy trước khi giao xe)
   */
  async cancelOrder(req, res) {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }

      if (order.buyer.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Chỉ buyer mới có thể hủy đơn hàng",
        });
      }

      // Chỉ cho phép hủy trước khi giao xe
      const cancellableStatuses = [
        OrderStatus.AWAITING_PAYMENT,
        OrderStatus.PAID_PARTIAL,
        OrderStatus.PAID_FULL,
        OrderStatus.PENDING_MEETING,
        OrderStatus.WAITING_CONFIRMATION,
        OrderStatus.NEGOTIATING,
        OrderStatus.PENDING_FINAL_PAYMENT,
      ];

      if (!cancellableStatuses.includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: "Không thể hủy đơn hàng ở trạng thái hiện tại",
        });
      }

      order.status = OrderStatus.CANCELLED_BY_BUYER;
      order.adminNotes = reason;
      await order.save();

      // Nếu đã thanh toán, tạo refund tự động với 100% hoàn tiền
      if (order.paidAmount > 0) {
        const { Refund, RefundReason } = require("../refund/refund.model");
        const refund = new Refund({
          order: order._id,
          requestedBy: userId,
          reason: RefundReason.BUYER_CHANGED_MIND,
          description: reason || "Buyer hủy đơn hàng",
          requestedAmount: order.paidAmount,
          finalRefundAmount: order.paidAmount, // 100% hoàn tiền
        });

        await refund.save();
      }

      // Log
      await this.createLog({
        type: LogType.ORDER_STATUS_CHANGE,
        order: order._id,
        user: userId,
        action: "cancel_order",
        description: "Buyer hủy đơn hàng",
        newData: { status: order.status, reason: reason },
        req: req,
      });

      // Gửi thông báo
      await notificationService.sendOrderNotification(order, "order_cancelled");

      res.json({
        success: true,
        message:
          order.paidAmount > 0
            ? "Đơn hàng đã được hủy và sẽ được hoàn tiền 100%"
            : "Đơn hàng đã được hủy thành công",
        data: {
          order: await this.populateOrder(order),
        },
      });
    } catch (error) {
      console.error("Cancel order error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hủy đơn hàng",
        error: error.message,
      });
    }
  }

  /**
   * Lấy danh sách đơn hàng
   */
  async getOrders(req, res) {
    try {
      const userId = req.user.id;
      const {
        role = "all", // 'buyer', 'seller', 'all'
        status,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const query = {};

      if (role === "buyer") {
        query.buyer = userId;
      } else if (role === "seller") {
        query.seller = userId;
      } else {
        query.$or = [{ buyer: userId }, { seller: userId }];
      }

      if (status) {
        query.status = status;
      }

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      const orders = await Order.find(query)
        .populate("buyer", "fullName email phoneNumber avatar")
        .populate("seller", "fullName email phoneNumber avatar")
        .populate("car", "name brand year price images")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Order.countDocuments(query);

      res.json({
        success: true,
        data: {
          orders: orders,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi lấy danh sách đơn hàng",
        error: error.message,
      });
    }
  }

  /**
   * Lấy chi tiết đơn hàng
   */
  async getOrderDetail(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;

      const order = await this.populateOrder(await Order.findById(orderId));

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }

      // Kiểm tra quyền xem
      const isOwner = [
        order.buyer._id.toString(),
        order.seller._id.toString(),
      ].includes(userId);
      const isAdmin = req.user.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xem đơn hàng này",
        });
      }

      // Lấy lịch sử thanh toán
      const payments = await Payment.find({ order: orderId }).sort({
        createdAt: -1,
      });

      // Lấy logs
      const logs = await Log.find({ order: orderId })
        .populate("user", "fullName email")
        .sort({ createdAt: -1 })
        .limit(20);

      res.json({
        success: true,
        data: {
          order: order,
          payments: payments,
          logs: logs,
        },
      });
    } catch (error) {
      console.error("Get order detail error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi lấy chi tiết đơn hàng",
        error: error.message,
      });
    }
  }

  /**
   * Download hợp đồng PDF
   */
  async downloadContract(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;

      const order = await Order.findById(orderId)
        .populate("buyer", "_id")
        .populate("seller", "_id");

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }

      // Kiểm tra quyền truy cập
      if (
        order.buyer._id.toString() !== userId &&
        order.seller._id.toString() !== userId &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền tải hợp đồng này",
        });
      }

      // Kiểm tra hợp đồng đã tồn tại
      if (!order.contract || !order.contract.url) {
        return res.status(404).json({
          success: false,
          message: "Hợp đồng chưa được tạo",
        });
      }

      // Log download
      await this.createLog({
        type: LogType.ADMIN_ACTION,
        order: order._id,
        user: userId,
        action: "download_contract",
        description: `Download hợp đồng ${order.contract.fileName}`,
        req: req,
      });

      res.json({
        success: true,
        data: {
          contractUrl: order.contract.url,
          fileName: order.contract.fileName,
          generatedAt: order.contract.generatedAt,
          fileSize: order.contract.fileSize,
        },
      });
    } catch (error) {
      console.error("Download contract error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi tải hợp đồng",
        error: error.message,
      });
    }
  }

  /**
   * Tạo lại hợp đồng (admin only)
   */
  async regenerateContract(req, res) {
    try {
      const { orderId } = req.params;

      const order = await this.populateOrder(await Order.findById(orderId));

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }

      // Lấy payment đã completed
      const payment = await Payment.findOne({
        order: orderId,
        status: PaymentStatus.COMPLETED,
      });

      if (!payment) {
        return res.status(400).json({
          success: false,
          message: "Không tìm thấy thanh toán đã hoàn thành",
        });
      }

      // Tạo hợp đồng mới
      const contractResult = await contractService.generateContract(
        order,
        payment
      );

      if (!contractResult.success) {
        return res.status(500).json({
          success: false,
          message: "Lỗi tạo hợp đồng",
          error: contractResult.error,
        });
      }

      // Cập nhật order
      order.contract = {
        url: contractResult.cloudinaryUrl,
        publicId: contractResult.cloudinaryPublicId,
        fileName: contractResult.fileName,
        generatedAt: new Date(),
        fileSize: contractResult.fileSize,
      };
      await order.save();

      // Log
      await this.createLog({
        type: LogType.CONTRACT_GENERATED,
        order: order._id,
        user: req.user.id,
        action: "regenerate_contract",
        description: `Tạo lại hợp đồng ${contractResult.fileName}`,
        newData: { contractUrl: contractResult.cloudinaryUrl },
        req: req,
      });

      res.json({
        success: true,
        message: "Tạo lại hợp đồng thành công",
        data: {
          contract: order.contract,
        },
      });
    } catch (error) {
      console.error("Regenerate contract error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi tạo lại hợp đồng",
        error: error.message,
      });
    }
  }

  // Helper methods
  async populateOrder(order) {
    if (!order) return null;

    return await Order.findById(order._id)
      .populate("buyer", "fullName email phoneNumber avatar address")
      .populate("seller", "fullName email phoneNumber avatar address")
      .populate("car");
  }

  async createLog({
    type,
    order,
    user,
    action,
    description,
    previousData,
    newData,
    req,
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
        ipAddress: req?.ip,
        userAgent: req?.get("User-Agent"),
      });

      await log.save();
      return log;
    } catch (error) {
      console.error("Create log error:", error);
    }
  }
}

module.exports = new OrderController();
