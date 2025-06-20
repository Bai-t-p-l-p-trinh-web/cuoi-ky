// Script tạo payments từ orders có sẵn trong DB
const mongoose = require("mongoose");
const { Order } = require("./backend/order/order.model");
const { User } = require("./backend/user/user.model");
const {
  Payment,
  PaymentStatus,
  PaymentType,
} = require("./backend/payment/payment.model");

// Kết nối MongoDB
mongoose.connect("mongodb://localhost:27017/car-marketplace");

async function createRealPayments() {
  try {
    console.log("🔍 Tìm orders có sẵn trong DB...");

    // Lấy tất cả orders chưa có payment
    const orders = await Order.find({
      status: { $in: ["awaiting_payment", "pending"] },
    })
      .populate("buyer")
      .limit(5); // Chỉ lấy 5 orders để demo

    console.log(`📋 Tìm thấy ${orders.length} orders`);

    for (const order of orders) {
      // Kiểm tra xem order này đã có payment chưa
      const existingPayment = await Payment.findOne({ order: order._id });

      if (!existingPayment) {
        // Tạo tên người thanh toán từ thông tin buyer
        const payerName = order.buyer.fullName
          ? order.buyer.fullName.toUpperCase()
          : `${order.buyer.firstName} ${order.buyer.lastName}`.toUpperCase();

        // Tạo payment mới từ order thật
        const newPayment = new Payment({
          user: order.buyer._id,
          order: order._id,
          amount: order.totalAmount * 0.2, // 20% deposit
          status: PaymentStatus.PENDING,
          transactionInfo: {
            bankTransactionId: `REAL${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            payerName: payerName,
            transferMessage: `THANH TOAN COC ${order.orderCode}`,
            transactionDate: new Date(),
            evidence: [],
          },
          paymentCode: `PAY${Date.now()}`,
          type: PaymentType.DEPOSIT,
        });

        await newPayment.save();
        console.log(
          `✅ Created payment ${newPayment.paymentCode} for order ${order.orderCode}`
        );
        console.log(
          `   💰 Amount: ${(order.totalAmount * 0.2).toLocaleString(
            "vi-VN"
          )} VNĐ`
        );
        console.log(`   👤 Payer: ${payerName}`);
        console.log(
          `   🔖 Transaction ID: ${newPayment.transactionInfo.bankTransactionId}`
        );
      }
    }

    console.log("🎉 Hoàn thành tạo payments từ orders thật!");
  } catch (error) {
    console.error("❌ Lỗi:", error);
  } finally {
    mongoose.disconnect();
  }
}

// Chạy script
createRealPayments();
