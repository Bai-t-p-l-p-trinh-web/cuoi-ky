/**
 * Script tạo payment với dữ liệu thực tế để test admin UI
 */

const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/car-marketplace", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createRealPayments() {
  try {
    console.log("🔄 Connecting to database...");

    // Import models
    const {
      Payment,
      PaymentStatus,
      PaymentType,
    } = require("./backend/payment/payment.model");
    const { Order, OrderStatus } = require("./backend/order/order.model");
    const { User } = require("./backend/user/user.model");
    const { Car } = require("./backend/car/car.model");

    // Tìm hoặc tạo users
    let buyer = await User.findOne({ email: "buyer@test.com" });
    if (!buyer) {
      buyer = new User({
        email: "buyer@test.com",
        fullName: "Nguyễn Văn Mua",
        firstName: "Mua",
        lastName: "Nguyễn Văn",
        phone: "0123456789",
        role: "customer",
        password: "hashedpassword123",
      });
      await buyer.save();
    }

    let seller = await User.findOne({ email: "seller@test.com" });
    if (!seller) {
      seller = new User({
        email: "seller@test.com",
        fullName: "Trần Thị Bán",
        firstName: "Bán",
        lastName: "Trần Thị",
        phone: "0987654321",
        role: "customer",
        password: "hashedpassword123",
      });
      await seller.save();
    }

    // Tìm hoặc tạo car
    let car = await Car.findOne();
    if (!car) {
      car = new Car({
        title: "Honda City 2020",
        price: 500000000,
        brand: "Honda",
        model: "City",
        year: 2020,
        seller: seller._id,
        status: "available",
        location: "hanoi",
        fuel: "gasoline",
        description: "Xe đẹp như mới",
      });
      await car.save();
    }

    // Tạo order
    const order = new Order({
      buyer: buyer._id,
      seller: seller._id,
      car: car._id,
      orderCode: `ORD${Date.now()}`,
      status: OrderStatus.AWAITING_PAYMENT,
      totalAmount: car.price,
      paidAmount: 0,
      paymentMethod: "deposit",
    });
    await order.save();

    // Tạo payments với dữ liệu thực
    const paymentsToCreate = [
      {
        user: buyer._id,
        order: order._id,
        amount: car.price * 0.2, // 20% cọc
        type: PaymentType.DEPOSIT,
        status: PaymentStatus.PENDING,
        paymentCode: `PAY${Date.now()}001`,
        transactionInfo: {
          bankTransactionId: "MB20240115123456",
          payerName: "NGUYEN VAN MUA",
          transferMessage: `THANH TOAN ${order.orderCode}`,
          transactionDate: new Date(),
          evidence: ["https://example.com/evidence1.jpg"],
        },
      },
      {
        user: buyer._id,
        order: order._id,
        amount: car.price * 0.2,
        type: PaymentType.DEPOSIT,
        status: PaymentStatus.PENDING,
        paymentCode: `PAY${Date.now()}002`,
        transactionInfo: {
          bankTransactionId: "VCB20240115789012",
          payerName: "NGUYEN VAN MUA",
          transferMessage: `COC XE ${order.orderCode}`,
          transactionDate: new Date(),
          evidence: [],
        },
      },
      {
        user: buyer._id,
        order: order._id,
        amount: car.price * 0.2, // 20% cọc đúng quy định
        type: PaymentType.DEPOSIT,
        status: PaymentStatus.PENDING,
        paymentCode: `PAY${Date.now()}003`,
        transactionInfo: {
          bankTransactionId: "ACB20240115345678",
          payerName: "NGUYEN VAN MUA", // Đúng tên người mua
          transferMessage: `Thanh toan xe ${order.orderCode}`,
          transactionDate: new Date(),
          evidence: ["https://example.com/evidence2.jpg"],
        },
      },
    ];

    console.log("💳 Creating realistic payments...");

    for (const paymentData of paymentsToCreate) {
      const payment = new Payment(paymentData);
      await payment.save();
      console.log(
        `✅ Created payment: ${payment.paymentCode} - ${payment.transactionInfo.payerName} - ${payment.transactionInfo.bankTransactionId}`
      );
    }

    console.log("\n🎉 Successfully created payments with real data!");
    console.log("\n📊 Summary:");
    console.log(`- Buyer: ${buyer.fullName} (${buyer.email})`);
    console.log(`- Seller: ${seller.fullName} (${seller.email})`);
    console.log(
      `- Car: ${car.title} - ${car.price.toLocaleString("vi-VN")} VNĐ`
    );
    console.log(`- Order: ${order.orderCode}`);
    console.log(
      `- Created ${paymentsToCreate.length} payments with real transaction info`
    );

    console.log("\n🔍 Real data fields:");
    console.log("- payerName: Tên người chuyển khoản thực");
    console.log("- bankTransactionId: Mã giao dịch ngân hàng thực");
    console.log("- transferMessage: Nội dung chuyển khoản");
    console.log("- transactionDate: Thời gian giao dịch");
    console.log("- evidence: Ảnh chứng từ (nếu có)");
  } catch (error) {
    console.error("❌ Error creating payments:", error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
createRealPayments();
