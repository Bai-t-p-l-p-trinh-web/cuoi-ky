/**
 * Script tạo dữ liệu mẫu cho demo
 * Chạy: node scripts/seed-demo-data.js
 */

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Import models
const User = require("../user/user.model");
const Car = require("../car/car.model");
const Category = require("../category/category.model");
const { Order, OrderStatus } = require("../order/order.model");

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected for seeding");
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err.message);
    process.exit(1);
  }
};

// Sample data
const createSampleUsers = async () => {
  console.log("🔄 Creating sample users...");

  const hashedPassword = await bcrypt.hash("123456Tien@", 10);

  const users = [
    {
      name: "Admin User",
      email: "admin@demo.com",
      phone: "0900000001",
      password: hashedPassword,
      role: "admin",
      isVerified: true,
    },
    {
      name: "Nguyen Van Seller",
      email: "seller1@demo.com",
      phone: "0900000002",
      password: hashedPassword,
      role: "seller",
      isVerified: true,
    },
    {
      name: "Tran Thi Seller",
      email: "seller2@demo.com",
      phone: "0900000003",
      password: hashedPassword,
      role: "seller",
      isVerified: true,
    },
    {
      name: "Le Van Buyer",
      email: "buyer1@demo.com",
      phone: "0900000004",
      password: hashedPassword,
      role: "buyer",
      isVerified: true,
    },
    {
      name: "Pham Thi Buyer",
      email: "buyer2@demo.com",
      phone: "0900000005",
      password: hashedPassword,
      role: "buyer",
      isVerified: true,
    },
  ];

  for (const userData of users) {
    const existingUser = await User.findOne({ email: userData.email });
    if (!existingUser) {
      await User.create(userData);
      console.log(`✅ Created user: ${userData.email}`);
    }
  }
};

const createSampleCategories = async () => {
  console.log("🔄 Creating sample categories...");

  const categories = [
    { title: "Sedan", description: "Xe sedan", status: "active", position: 1 },
    { title: "SUV", description: "Xe SUV", status: "active", position: 2 },
    {
      title: "Hatchback",
      description: "Xe hatchback",
      status: "active",
      position: 3,
    },
    {
      title: "Pickup",
      description: "Xe bán tải",
      status: "active",
      position: 4,
    },
    {
      title: "Convertible",
      description: "Xe mui trần",
      status: "active",
      position: 5,
    },
  ];

  for (const categoryData of categories) {
    const existingCategory = await Category.findOne({
      title: categoryData.title,
    });
    if (!existingCategory) {
      await Category.create(categoryData);
      console.log(`✅ Created category: ${categoryData.title}`);
    }
  }
};

const createSampleCars = async () => {
  console.log("🔄 Creating sample cars...");

  const sellers = await User.find({ role: "seller" });
  if (sellers.length === 0) {
    console.log("❌ No sellers found, skipping car creation");
    return;
  }

  const sampleCars = [
    {
      title: "Toyota Camry 2020",
      brand: "Toyota",
      model: "Camry",
      price: 850000000,
      year: 2020,
      km: 25000,
      fuel_use: {
        fuel_type: "gasoline",
        fuel_name: "Xăng",
      },
      seat_capacity: 5,
      comment: "Xe đẹp, bảo dưỡng định kỳ, không tai nạn",
      description: "Toyota Camry 2020 màu trắng, nội thất da, đầy đủ tiện nghi",
      img_src: [
        "https://images.unsplash.com/photo-1549924231-f129b911e442?w=800",
        "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800",
      ],
      location: {
        query_location: "ho-chi-minh",
        query_name: "Thành phố Hồ Chí Minh",
      },
      status: "selling",
      sellerId: sellers[0]._id.toString(),
    },
    {
      title: "Honda CR-V 2019",
      brand: "Honda",
      model: "CR-V",
      price: 750000000,
      year: 2019,
      km: 35000,
      fuel_use: {
        fuel_type: "gasoline",
        fuel_name: "Xăng",
      },
      seat_capacity: 7,
      comment: "SUV 7 chỗ, gia đình sử dụng kỹ",
      description: "Honda CR-V 2019 màu đỏ, xe gia đình sử dụng",
      img_src: [
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
      ],
      location: {
        query_location: "ha-noi",
        query_name: "Hà Nội",
      },
      status: "selling",
      sellerId: sellers[1]._id.toString(),
    },
    {
      title: "BMW X5 2021",
      brand: "BMW",
      model: "X5",
      price: 1850000000,
      year: 2021,
      km: 15000,
      fuel_use: {
        fuel_type: "gasoline",
        fuel_name: "Xăng",
      },
      seat_capacity: 5,
      comment: "Xe sang, chạy ít, giá tốt",
      description: "BMW X5 2021 màu đen, full option",
      img_src: [
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
      ],
      location: {
        query_location: "ho-chi-minh",
        query_name: "Thành phố Hồ Chí Minh",
      },
      status: "selling",
      sellerId: sellers[0]._id.toString(),
    },
  ];

  for (const carData of sampleCars) {
    const existingCar = await Car.findOne({ title: carData.title });
    if (!existingCar) {
      await Car.create(carData);
      console.log(`✅ Created car: ${carData.title}`);
    }
  }
};

const createSampleOrders = async () => {
  console.log("🔄 Creating sample orders...");

  const buyers = await User.find({ role: "buyer" });
  const cars = await Car.find({ status: "selling" });

  if (buyers.length === 0 || cars.length === 0) {
    console.log("❌ Not enough buyers or cars for orders");
    return;
  }

  const sampleOrder = {
    buyer: buyers[0]._id,
    seller: mongoose.Types.ObjectId(cars[0].sellerId),
    car: cars[0]._id,
    status: OrderStatus.PENDING_MEETING,
    paymentMethod: "deposit",
    totalAmount: cars[0].price,
    depositAmount: cars[0].price * 0.1,
    remainingAmount: cars[0].price * 0.9,
    paidAmount: cars[0].price * 0.1,
    deliveryInfo: {
      address: "123 Demo Street, Ho Chi Minh City",
      notes: "Demo order for testing",
    },
  };

  const existingOrder = await Order.findOne({
    buyer: sampleOrder.buyer,
    car: sampleOrder.car,
  });

  if (!existingOrder) {
    await Order.create(sampleOrder);
    console.log("✅ Created sample order");
  }
};

// Main seeding function
const seedData = async () => {
  try {
    await connectDB();

    console.log("🚀 Starting demo data seeding...");

    await createSampleUsers();
    await createSampleCategories();
    await createSampleCars();
    await createSampleOrders();

    console.log("🎉 Demo data seeding completed!");
    console.log("\n📋 Demo Accounts:");
    console.log("Admin: admin@demo.com / 123456");
    console.log("Seller 1: seller1@demo.com / 123456");
    console.log("Seller 2: seller2@demo.com / 123456");
    console.log("Buyer 1: buyer1@demo.com / 123456");
    console.log("Buyer 2: buyer2@demo.com / 123456");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedData();
}

module.exports = { seedData };
