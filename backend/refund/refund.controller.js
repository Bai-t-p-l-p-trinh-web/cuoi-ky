const { Refund, RefundStatus, RefundReason } = require("./refund.model");
const { Order, OrderStatus } = require("../order/order.model");
const { Log, LogType } = require("../log/log.model");
const notificationService = require("../utils/notificationService");

class RefundController {
  /**
   * Tạo yêu cầu hoàn tiền
   */
  async createRefund(req, res) {
    try {
      const { orderId, reason, description, evidence } = req.body;
      const userId = req.user.id;

      // Kiểm tra đơn hàng
      const order = await Order.findById(orderId).populate("buyer seller car");

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }

      // Chỉ buyer mới được yêu cầu refund
      if (order.buyer._id.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Chỉ buyer mới có thể yêu cầu hoàn tiền",
        });
      }

      // Kiểm tra trạng thái đơn hàng
      const refundableStatuses = [
        OrderStatus.PAID_PARTIAL,
        OrderStatus.PAID_FULL,
        OrderStatus.WAITING_CONFIRMATION,
        OrderStatus.DELIVERY_IN_PROGRESS,
        OrderStatus.DELIVERED,
      ];

      if (!refundableStatuses.includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: "Đơn hàng không ở trạng thái có thể hoàn tiền",
        });
      }

      // Kiểm tra đã có refund request chưa
      const existingRefund = await Refund.findOne({
        order: orderId,
        status: { $in: [RefundStatus.REQUESTED, RefundStatus.PROCESSING] },
      });

      if (existingRefund) {
        return res.status(400).json({
          success: false,
          message: "Đã có yêu cầu hoàn tiền đang xử lý",
        });
      }

      // Tạo refund request
      const refund = new Refund({
        order: orderId,
        requestedBy: userId,
        reason: reason,
        description: description,
        requestedAmount: order.paidAmount,
        evidence: evidence || [],
      });

      await refund.save();

      // Cập nhật trạng thái đơn hàng
      order.status = OrderStatus.REFUNDING;
      await order.save();

      // Log
      await this.createLog({
        type: LogType.REFUND_REQUESTED,
        order: orderId,
        user: userId,
        action: "create_refund",
        description: `Tạo yêu cầu hoàn tiền ${refund.refundCode}`,
        newData: {
          refundCode: refund.refundCode,
          reason: reason,
          requestedAmount: order.paidAmount,
        },
        req: req,
      });

      // Gửi thông báo
      await notificationService.sendRefundNotification(refund, "created");

      res.status(201).json({
        success: true,
        message: "Đã tạo yêu cầu hoàn tiền thành công",
        data: {
          refund: await this.populateRefund(refund),
          order: order,
        },
      });
    } catch (error) {
      console.error("Create refund error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi tạo yêu cầu hoàn tiền",
        error: error.message,
      });
    }
  }

  /**
   * Seller phản hồi yêu cầu hoàn tiền
   */
  async sellerResponse(req, res) {
    try {
      const { refundId } = req.params;
      const { agreed, reason, evidence } = req.body;
      const userId = req.user.id;

      const refund = await Refund.findById(refundId).populate({
        path: "order",
        populate: {
          path: "seller buyer car",
        },
      });

      if (!refund) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy yêu cầu hoàn tiền",
        });
      }

      // Chỉ seller mới được phản hồi
      if (refund.order.seller._id.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Chỉ seller mới có thể phản hồi yêu cầu hoàn tiền",
        });
      }

      if (refund.status !== RefundStatus.REQUESTED) {
        return res.status(400).json({
          success: false,
          message: "Yêu cầu hoàn tiền đã được xử lý",
        });
      }

      // Cập nhật phản hồi từ seller
      refund.sellerResponse = {
        agreed: agreed,
        reason: reason,
        evidence: evidence || [],
        respondedAt: new Date(),
      };

      refund.status = RefundStatus.PROCESSING;
      await refund.save();

      // Log
      await this.createLog({
        type: LogType.REFUND_PROCESSED,
        order: refund.order._id,
        user: userId,
        action: "seller_response",
        description: `Seller ${
          agreed ? "đồng ý" : "từ chối"
        } yêu cầu hoàn tiền`,
        newData: {
          sellerAgreed: agreed,
          reason: reason,
        },
        req: req,
      });

      // Gửi thông báo
      await notificationService.sendRefundNotification(
        refund,
        "seller_responded"
      );

      res.json({
        success: true,
        message: `Đã ${agreed ? "đồng ý" : "từ chối"} yêu cầu hoàn tiền`,
        data: {
          refund: await this.populateRefund(refund),
        },
      });
    } catch (error) {
      console.error("Seller response error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi phản hồi yêu cầu hoàn tiền",
        error: error.message,
      });
    }
  }

  /**
   * Xác nhận seller đã nhận lại xe (đối với trường hợp refund)
   */
  async confirmCarReturn(req, res) {
    try {
      const { refundId } = req.params;
      const { evidence, notes } = req.body;
      const userId = req.user.id;

      const refund = await Refund.findById(refundId).populate({
        path: "order",
        populate: {
          path: "seller buyer car",
        },
      });

      if (!refund) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy yêu cầu hoàn tiền",
        });
      }

      // Chỉ seller mới được xác nhận nhận lại xe
      if (refund.order.seller._id.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Chỉ seller mới có thể xác nhận nhận lại xe",
        });
      }

      if (refund.status !== RefundStatus.PROCESSING) {
        return res.status(400).json({
          success: false,
          message: "Yêu cầu hoàn tiền không ở trạng thái phù hợp",
        });
      }

      // Cập nhật xác nhận nhận lại xe
      refund.carReturnConfirmed = true;
      refund.carReturnConfirmedAt = new Date();
      refund.carReturnEvidence = evidence || [];
      refund.status = RefundStatus.APPROVED;

      await refund.save();

      // Log
      await this.createLog({
        type: LogType.REFUND_PROCESSED,
        order: refund.order._id,
        user: userId,
        action: "confirm_car_return",
        description: "Seller xác nhận đã nhận lại xe",
        newData: {
          carReturnConfirmed: true,
          notes: notes,
        },
        req: req,
      });

      // Gửi thông báo
      await notificationService.sendRefundNotification(
        refund,
        "car_return_confirmed"
      );

      res.json({
        success: true,
        message: "Đã xác nhận nhận lại xe thành công",
        data: {
          refund: await this.populateRefund(refund),
        },
      });
    } catch (error) {
      console.error("Confirm car return error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi xác nhận nhận lại xe",
        error: error.message,
      });
    }
  }

  /**
   * Admin xử lý yêu cầu hoàn tiền
   */
  async adminProcessRefund(req, res) {
    try {
      const { refundId } = req.params;
      const {
        approved,
        deductions,
        finalRefundAmount,
        adminNotes,
        refundTransaction,
      } = req.body;
      const userId = req.user.id;

      // Kiểm tra quyền admin
      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Chỉ admin mới có thể xử lý yêu cầu hoàn tiền",
        });
      }

      const refund = await Refund.findById(refundId).populate({
        path: "order",
        populate: {
          path: "seller buyer car",
        },
      });

      if (!refund) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy yêu cầu hoàn tiền",
        });
      }

      if (
        ![RefundStatus.PROCESSING, RefundStatus.APPROVED].includes(
          refund.status
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Yêu cầu hoàn tiền không ở trạng thái có thể xử lý",
        });
      }

      // Cập nhật thông tin xử lý
      refund.status = approved ? RefundStatus.COMPLETED : RefundStatus.REJECTED;
      refund.processedBy = userId;
      refund.processedAt = new Date();
      refund.adminNotes = adminNotes;

      if (approved) {
        refund.deductions = deductions || {};
        refund.finalRefundAmount = finalRefundAmount || refund.requestedAmount;
        refund.refundTransaction = refundTransaction;
      }

      await refund.save();

      // Cập nhật trạng thái đơn hàng
      if (approved) {
        refund.order.status = OrderStatus.COMPLETED;
      } else {
        // Nếu từ chối refund, có thể quay lại trạng thái trước đó
        refund.order.status = OrderStatus.DISPUTED;
      }
      await refund.order.save();

      // Log
      await this.createLog({
        type: LogType.REFUND_PROCESSED,
        order: refund.order._id,
        user: userId,
        action: approved ? "approve_refund" : "reject_refund",
        description: `Admin ${
          approved ? "chấp thuận" : "từ chối"
        } yêu cầu hoàn tiền`,
        newData: {
          status: refund.status,
          finalRefundAmount: refund.finalRefundAmount,
          adminNotes: adminNotes,
        },
        req: req,
      });

      // Gửi thông báo
      await notificationService.sendRefundNotification(
        refund,
        approved ? "approved" : "rejected"
      );

      res.json({
        success: true,
        message: `Đã ${approved ? "chấp thuận" : "từ chối"} yêu cầu hoàn tiền`,
        data: {
          refund: await this.populateRefund(refund),
        },
      });
    } catch (error) {
      console.error("Admin process refund error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi xử lý yêu cầu hoàn tiền",
        error: error.message,
      });
    }
  }

  /**
   * Lấy danh sách yêu cầu hoàn tiền
   */
  async getRefunds(req, res) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const {
        role = "all", // 'requester', 'seller', 'all'
        status,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const query = {};

      // Nếu không phải admin, chỉ xem được refund liên quan đến mình
      if (userRole !== "admin") {
        if (role === "requester") {
          query.requestedBy = userId;
        } else if (role === "seller") {
          // Tìm refund của các đơn hàng mà user là seller
          const Order = require("../order/order.model").Order;
          const orderIds = await Order.find({ seller: userId }).distinct("_id");
          query.order = { $in: orderIds };
        } else {
          // Tìm tất cả refund liên quan (buyer hoặc seller)
          const Order = require("../order/order.model").Order;
          const orderIds = await Order.find({
            $or: [{ buyer: userId }, { seller: userId }],
          }).distinct("_id");
          query.order = { $in: orderIds };
        }
      }

      if (status) {
        query.status = status;
      }

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      const refunds = await Refund.find(query)
        .populate({
          path: "order",
          populate: {
            path: "buyer seller car",
            select: "fullName email phoneNumber name brand year price",
          },
        })
        .populate("requestedBy", "fullName email phoneNumber")
        .populate("processedBy", "fullName email")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Refund.countDocuments(query);

      res.json({
        success: true,
        data: {
          refunds: refunds,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Get refunds error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi lấy danh sách hoàn tiền",
        error: error.message,
      });
    }
  }

  /**
   * Lấy chi tiết yêu cầu hoàn tiền
   */
  async getRefundDetail(req, res) {
    try {
      const { refundId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const refund = await this.populateRefund(await Refund.findById(refundId));

      if (!refund) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy yêu cầu hoàn tiền",
        });
      }

      // Kiểm tra quyền xem
      const isRequester = refund.requestedBy._id.toString() === userId;
      const isSeller = refund.order.seller._id.toString() === userId;
      const isAdmin = userRole === "admin";

      if (!isRequester && !isSeller && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xem yêu cầu hoàn tiền này",
        });
      }

      // Lấy logs liên quan
      const logs = await Log.find({
        order: refund.order._id,
        type: LogType.REFUND_REQUESTED,
      })
        .populate("user", "fullName email")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: {
          refund: refund,
          logs: logs,
        },
      });
    } catch (error) {
      console.error("Get refund detail error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi lấy chi tiết hoàn tiền",
        error: error.message,
      });
    }
  }

  // Helper methods
  async populateRefund(refund) {
    if (!refund) return null;

    return await Refund.findById(refund._id)
      .populate({
        path: "order",
        populate: {
          path: "buyer seller car",
          select: "fullName email phoneNumber name brand year price images",
        },
      })
      .populate("requestedBy", "fullName email phoneNumber avatar")
      .populate("processedBy", "fullName email");
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

module.exports = new RefundController();
