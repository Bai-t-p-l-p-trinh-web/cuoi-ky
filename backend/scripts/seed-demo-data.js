/**
 * Script tạo dữ liệu mẫu cho demo (User, Category, Car - không seed Order)
 * Chạy: node scripts/seed-demo-data.js
 */

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Import models
const User = require("../user/user.model");
const Car = require("../car/car.model");
const Category = require("../category/category.model");

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
      name: "Admin System",
      email: "admin@carmarket.com",
      phone: "0900000001",
      password: hashedPassword,
      role: "admin",
      isVerified: true,
      address: "123 Admin Street, Ward 1",
      city: "Ho Chi Minh City",
      district: "District 1",
      CCCD: "001234567890",
      contactEmail: "admin@carmarket.com",
      contactFacebook: "facebook.com/admin.carmarket",
      bankInfo: {
        bankName: "Vietcombank - Ngân hàng TMCP Ngoại thương Việt Nam",
        bankCode: "970436",
        accountNumber: "1234567890123456",
        accountHolder: "ADMIN SYSTEM",
        isVerified: true,
        verifiedAt: new Date(),
      },
    },
    {
      name: "Inspector Manager",
      email: "inspector@carmarket.com",
      phone: "0900000002",
      password: hashedPassword,
      role: "staff",
      isVerified: true,
      address: "456 Inspector Avenue, Ward 2",
      city: "Ho Chi Minh City",
      district: "District 1",
      CCCD: "002345678901",
      contactEmail: "inspector@carmarket.com",
      contactZalo: "0900000002",
    },
    {
      name: "Nguyen Van Duc",
      email: "seller1@demo.com",
      phone: "0900000003",
      password: hashedPassword,
      role: "seller",
      isVerified: true,
      address: "789 Seller Street, Ward 5",
      city: "Ho Chi Minh City",
      district: "District 3",
      CCCD: "123456789012",
      contactFacebook: "facebook.com/nguyenvanduc",
      contactZalo: "0900000003",
      contactEmail: "nguyenvanduc@gmail.com",
      contactLinkedin: "linkedin.com/in/nguyenvanduc",
      bankInfo: {
        bankName: "Techcombank - Ngân hàng TMCP Kỹ thương Việt Nam",
        bankCode: "970407",
        accountNumber: "9876543210987654",
        accountHolder: "NGUYEN VAN DUC",
        isVerified: true,
        verifiedAt: new Date(),
      },
    },
    {
      name: "Tran Thi Huong",
      email: "seller2@demo.com",
      phone: "0900000004",
      password: hashedPassword,
      role: "seller",
      isVerified: true,
      address: "321 Seller Boulevard, Ward 3",
      city: "Ha Noi",
      district: "Cau Giay",
      CCCD: "987654321098",
      contactZalo: "0900000004",
      contactEmail: "tranthihuong@outlook.com",
      contactFacebook: "facebook.com/tranthihuong",
      bankInfo: {
        bankName: "VietinBank - Ngân hàng TMCP Công thương Việt Nam",
        bankCode: "970415",
        accountNumber: "5555666677778888",
        accountHolder: "TRAN THI HUONG",
        isVerified: true,
        verifiedAt: new Date(),
      },
    },
    {
      name: "Pham Van Minh",
      email: "seller3@demo.com",
      phone: "0900000005",
      password: hashedPassword,
      role: "seller",
      isVerified: true,
      address: "654 Car Street, Ward 7",
      city: "Da Nang",
      district: "Hai Chau",
      CCCD: "456789012345",
      contactEmail: "phamvanminh@yahoo.com",
      contactZalo: "0900000005",
      bankInfo: {
        bankName: "BIDV - Ngân hàng TMCP Đầu tư và Phát triển Việt Nam",
        bankCode: "970418",
        accountNumber: "1111222233334444",
        accountHolder: "PHAM VAN MINH",
        isVerified: false, // Chưa xác thực để test luồng verify
        verifiedAt: null,
      },
    },
    {
      name: "Le Thi Lan",
      email: "buyer1@demo.com",
      phone: "0900000006",
      password: hashedPassword,
      role: "user",
      isVerified: true,
      address: "987 Buyer Road, Ward 12",
      city: "Ho Chi Minh City",
      district: "District 7",
      CCCD: "789012345678",
      contactEmail: "lethilan@gmail.com",
      contactFacebook: "facebook.com/lethilan",
    },
    {
      name: "Vo Van Hung",
      email: "buyer2@demo.com",
      phone: "0900000007",
      password: hashedPassword,
      role: "user",
      isVerified: true,
      address: "147 Customer Avenue, Ward 8",
      city: "Can Tho",
      district: "Ninh Kieu",
      contactZalo: "0900000007",
      contactEmail: "vovanhung@hotmail.com",
    },
    {
      name: "Hoang Thi Mai",
      email: "buyer3@demo.com",
      phone: "0900000008",
      password: hashedPassword,
      role: "user",
      isVerified: true,
      address: "258 User Street, Ward 4",
      city: "Da Nang",
      district: "Thanh Khe",
      CCCD: "345678901234",
      contactEmail: "hoangthimai@gmail.com",
      contactLinkedin: "linkedin.com/in/hoangthimai",
    },
  ];

  for (const userData of users) {
    const existingUser = await User.findOne({ email: userData.email });
    if (!existingUser) {
      await User.create(userData);
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    } else {
      console.log(`⚠️  User already exists: ${userData.email}`);
    }
  }
};

const createSampleCategories = async () => {
  console.log("🔄 Creating sample categories...");

  const categories = [
    {
      title: "Sedan",
      parent_id: "",
      description: "Xe sedan 4 cửa, phù hợp cho gia đình nhỏ",
      thumbnail:
        "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400",
      status: "active",
      position: 1,
    },
    {
      title: "SUV",
      parent_id: "",
      description: "Xe thể thao đa dụng, gầm cao, phù hợp cho mọi địa hình",
      thumbnail:
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400",
      status: "active",
      position: 2,
    },
    {
      title: "Hatchback",
      parent_id: "",
      description: "Xe 5 cửa nhỏ gọn, tiết kiệm nhiên liệu",
      thumbnail:
        "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400",
      status: "active",
      position: 3,
    },
    {
      title: "Pickup",
      parent_id: "",
      description: "Xe bán tải, phù hợp cho vận chuyển hàng hóa",
      thumbnail:
        "https://images.unsplash.com/photo-1544819667-3457d871b4b4?w=400",
      status: "active",
      position: 4,
    },
    {
      title: "Coupe",
      parent_id: "",
      description: "Xe thể thao 2 cửa, thiết kế sang trọng",
      thumbnail:
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400",
      status: "active",
      position: 5,
    },
    {
      title: "Convertible",
      parent_id: "",
      description: "Xe mui trần, trải nghiệm lái xe tuyệt vời",
      thumbnail:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400",
      status: "active",
      position: 6,
    },
    {
      title: "Wagon",
      parent_id: "",
      description: "Xe station wagon, không gian rộng rãi",
      thumbnail:
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400",
      status: "active",
      position: 7,
    },
    {
      title: "Minivan",
      parent_id: "",
      description: "Xe gia đình 7-8 chỗ, phù hợp cho gia đình đông người",
      thumbnail:
        "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400",
      status: "active",
      position: 8,
    },
  ];

  for (const categoryData of categories) {
    const existingCategory = await Category.findOne({
      title: categoryData.title,
    });
    if (!existingCategory) {
      await Category.create(categoryData);
      console.log(`✅ Created category: ${categoryData.title}`);
    } else {
      console.log(`⚠️  Category already exists: ${categoryData.title}`);
    }
  }
};

const createSampleCars = async () => {
  console.log("🔄 Creating sample cars...");

  const sellers = await User.find({ role: "seller" });
  const categories = await Category.find({ status: "active" });

  if (sellers.length === 0) {
    console.log("❌ No sellers found, skipping car creation");
    return;
  }

  if (categories.length === 0) {
    console.log("❌ No categories found, skipping car creation");
    return;
  }

  const sampleCars = [
    {
      title: "Toyota Camry 2020 - Xe sedan hạng sang",
      brand: "Toyota",
      model: "Camry",
      category_id:
        categories.find((c) => c.title === "Sedan")?._id.toString() || "",
      price: 850000000,
      year: 2020,
      km: 25000,
      fuel: "gasoline",
      fuel_use: {
        fuel_type: "gasoline",
        fuel_name: "Xăng RON 95",
      },
      seat_capacity: 5,
      comment:
        "Xe đẹp như mới, bảo dưỡng định kỳ tại hãng, không tai nạn, không ngập nước. Giấy tờ đầy đủ, sẵn sàng sang tên.",
      description:
        "Toyota Camry 2020 màu trắng ngọc trai, nội thất da màu đen sang trọng. Xe được trang bị đầy đủ tiện nghi: màn hình cảm ứng 8 inch, camera lùi, cảnh báo điểm mù, phanh tự động khẩn cấp. Động cơ 2.5L tiết kiệm nhiên liệu, hộp số CVT mượt mà.",
      img_src: [
        "https://images.unsplash.com/photo-1549924231-f129b911e442?w=800",
        "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800",
        "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800",
      ],
      img_demo:
        "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400",
      location: {
        query_location: "ho-chi-minh",
        query_name: "Thành phố Hồ Chí Minh",
      },
      status: "selling",
      sellerId: sellers[0]._id.toString(),
      sellerBankInfo: {
        bankName:
          sellers[0].bankInfo?.bankName ||
          "Techcombank - Ngân hàng TMCP Kỹ thương Việt Nam",
        bankCode: sellers[0].bankInfo?.bankCode || "970407",
        accountNumber: sellers[0].bankInfo?.accountNumber || "9876543210987654",
        accountHolder:
          sellers[0].bankInfo?.accountHolder || sellers[0].name.toUpperCase(),
      },
    },
    {
      title: "Honda CR-V 2019 - SUV 7 chỗ gia đình",
      brand: "Honda",
      model: "CR-V",
      category_id:
        categories.find((c) => c.title === "SUV")?._id.toString() || "",
      price: 750000000,
      year: 2019,
      km: 35000,
      fuel: "gasoline",
      fuel_use: {
        fuel_type: "gasoline",
        fuel_name: "Xăng RON 92",
      },
      seat_capacity: 7,
      comment:
        "SUV 7 chỗ rộng rãi, gia đình sử dụng cẩn thận. Xe chạy êm, máy móc tốt, nội thất sạch sẽ.",
      description:
        "Honda CR-V 2019 màu đỏ rượu vang, nội thất vải cao cấp. Xe được trang bị hệ thống Honda SENSING an toàn, màn hình giải trí, điều hòa tự động 2 vùng. Động cơ 1.5L turbo mạnh mẽ, tiết kiệm nhiên liệu. Phù hợp cho gia đình đông người.",
      img_src: [
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
        "https://images.unsplash.com/photo-1562141961-ba76af4a2cf8?w=800",
      ],
      img_demo:
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400",
      location: {
        query_location: "ha-noi",
        query_name: "Hà Nội",
      },
      status: "selling",
      sellerId: sellers[1]._id.toString(),
      sellerBankInfo: {
        bankName:
          sellers[1].bankInfo?.bankName ||
          "VietinBank - Ngân hàng TMCP Công thương Việt Nam",
        bankCode: sellers[1].bankInfo?.bankCode || "970415",
        accountNumber: sellers[1].bankInfo?.accountNumber || "5555666677778888",
        accountHolder:
          sellers[1].bankInfo?.accountHolder || sellers[1].name.toUpperCase(),
      },
    },
    {
      title: "BMW X5 2021 - SUV hạng sang",
      brand: "BMW",
      model: "X5",
      category_id:
        categories.find((c) => c.title === "SUV")?._id.toString() || "",
      price: 1850000000,
      year: 2021,
      km: 15000,
      fuel: "gasoline",
      fuel_use: {
        fuel_type: "gasoline",
        fuel_name: "Xăng RON 95",
      },
      seat_capacity: 5,
      comment:
        "Xe sang BMW chính hãng, chạy ít, bảo hành còn hạn. Giá tốt nhất thị trường.",
      description:
        "BMW X5 2021 màu đen metallic, nội thất da Nappa cao cấp. Xe được trang bị dynamic package, panoramic sunroof, hệ thống âm thanh Harman Kardon, ghế massage. Động cơ 3.0L twin-turbo mạnh mẽ 340HP. Xe như mới, còn bảo hành chính hãng.",
      img_src: [
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
        "https://images.unsplash.com/photo-1544819667-3457d871b4b4?w=800",
      ],
      img_demo:
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400",
      location: {
        query_location: "ho-chi-minh",
        query_name: "Thành phố Hồ Chí Minh",
      },
      status: "selling",
      sellerId: sellers[0]._id.toString(),
      sellerBankInfo: {
        bankName:
          sellers[0].bankInfo?.bankName ||
          "Techcombank - Ngân hàng TMCP Kỹ thương Việt Nam",
        bankCode: sellers[0].bankInfo?.bankCode || "970407",
        accountNumber: sellers[0].bankInfo?.accountNumber || "9876543210987654",
        accountHolder:
          sellers[0].bankInfo?.accountHolder || sellers[0].name.toUpperCase(),
      },
    },
    {
      title: "Mazda CX-5 2020 - SUV tiết kiệm nhiên liệu",
      brand: "Mazda",
      model: "CX-5",
      category_id:
        categories.find((c) => c.title === "SUV")?._id.toString() || "",
      price: 680000000,
      year: 2020,
      km: 28000,
      fuel: "gasoline",
      fuel_use: {
        fuel_type: "gasoline",
        fuel_name: "Xăng RON 95",
      },
      seat_capacity: 5,
      comment:
        "Xe Mazda chính hãng, tiết kiệm nhiên liệu, thiết kế đẹp mắt. Bảo dưỡng định kỳ.",
      description:
        "Mazda CX-5 2020 màu xám bạc, nội thất da đen. Xe sử dụng công nghệ SkyActiv tiết kiệm nhiên liệu, hệ thống i-Activsense an toàn. Màn hình MZD Connect, camera 360 độ, cảnh báo va chạm. Thiết kế Kodo đẹp mắt, động cơ 2.0L mạnh mẽ.",
      img_src: [
        "https://images.unsplash.com/photo-1562141961-ba76af4a2cf8?w=800",
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
      ],
      img_demo:
        "https://images.unsplash.com/photo-1562141961-ba76af4a2cf8?w=400",
      location: {
        query_location: "da-nang",
        query_name: "Đà Nẵng",
      },
      status: "selling",
      sellerId: sellers[2]._id.toString(),
      sellerBankInfo: {
        bankName:
          sellers[2].bankInfo?.bankName ||
          "BIDV - Ngân hàng TMCP Đầu tư và Phát triển Việt Nam",
        bankCode: sellers[2].bankInfo?.bankCode || "970418",
        accountNumber: sellers[2].bankInfo?.accountNumber || "1111222233334444",
        accountHolder:
          sellers[2].bankInfo?.accountHolder || sellers[2].name.toUpperCase(),
      },
    },
    {
      title: "Honda Civic 2018 - Sedan thể thao",
      brand: "Honda",
      model: "Civic",
      category_id:
        categories.find((c) => c.title === "Sedan")?._id.toString() || "",
      price: 590000000,
      year: 2018,
      km: 45000,
      fuel: "gasoline",
      fuel_use: {
        fuel_type: "gasoline",
        fuel_name: "Xăng RON 92",
      },
      seat_capacity: 5,
      comment:
        "Honda Civic thể thao, động cơ turbo mạnh mẽ. Xe đẹp, máy móc tốt.",
      description:
        "Honda Civic 2018 màu trắng pearl, nội thất đen thể thao. Xe có động cơ 1.5L turbo mạnh mẽ, hộp số CVT, hệ thống Honda SENSING. Thiết kế trẻ trung, thể thao với đèn LED, mâm đúc thể thao. Phù hợp cho người trẻ yêu thích tốc độ.",
      img_src: [
        "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800",
        "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800",
      ],
      img_demo:
        "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400",
      location: {
        query_location: "ha-noi",
        query_name: "Hà Nội",
      },
      status: "selling",
      sellerId: sellers[1]._id.toString(),
      sellerBankInfo: {
        bankName:
          sellers[1].bankInfo?.bankName ||
          "VietinBank - Ngân hàng TMCP Công thương Việt Nam",
        bankCode: sellers[1].bankInfo?.bankCode || "970415",
        accountNumber: sellers[1].bankInfo?.accountNumber || "5555666677778888",
        accountHolder:
          sellers[1].bankInfo?.accountHolder || sellers[1].name.toUpperCase(),
      },
    },
    {
      title: "Ford Ranger 2019 - Pickup bán tải",
      brand: "Ford",
      model: "Ranger",
      category_id:
        categories.find((c) => c.title === "Pickup")?._id.toString() || "",
      price: 720000000,
      year: 2019,
      km: 32000,
      fuel: "oil",
      fuel_use: {
        fuel_type: "oil",
        fuel_name: "Dầu Diesel",
      },
      seat_capacity: 5,
      comment:
        "Pickup Ford Ranger chính hãng, máy dầu tiết kiệm, khỏe khoắn. Phù hợp kinh doanh.",
      description:
        "Ford Ranger 2019 màu xanh navy, nội thất da. Xe có động cơ dầu 2.0L bi-turbo mạnh mẽ, hộp số 10 cấp, hệ dẫn động 4WD. Thùng xe rộng rãi, có nắp thùng cứng. Phù hợp cho kinh doanh vận tải hoặc off-road. Xe chạy êm, tiết kiệm nhiên liệu.",
      img_src: [
        "https://images.unsplash.com/photo-1544819667-3457d871b4b4?w=800",
        "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800",
      ],
      img_demo:
        "https://images.unsplash.com/photo-1544819667-3457d871b4b4?w=400",
      location: {
        query_location: "ho-chi-minh",
        query_name: "Thành phố Hồ Chí Minh",
      },
      status: "selling",
      sellerId: sellers[0]._id.toString(),
      sellerBankInfo: {
        bankName:
          sellers[0].bankInfo?.bankName ||
          "Techcombank - Ngân hàng TMCP Kỹ thương Việt Nam",
        bankCode: sellers[0].bankInfo?.bankCode || "970407",
        accountNumber: sellers[0].bankInfo?.accountNumber || "9876543210987654",
        accountHolder:
          sellers[0].bankInfo?.accountHolder || sellers[0].name.toUpperCase(),
      },
    },
  ];

  for (const carData of sampleCars) {
    const existingCar = await Car.findOne({ title: carData.title });
    if (!existingCar) {
      await Car.create(carData);
      console.log(`✅ Created car: ${carData.title}`);
    } else {
      console.log(`⚠️  Car already exists: ${carData.title}`);
    }
  }
};

// Main seeding function
const seedData = async () => {
  try {
    await connectDB();

    console.log("🚀 Starting demo data seeding...");
    console.log(
      "📝 Note: This script seeds User, Category, and Car data only (no Order data)"
    );

    await createSampleUsers();
    await createSampleCategories();
    await createSampleCars();

    console.log("\n🎉 Demo data seeding completed successfully!");
    console.log("\n📋 Demo Accounts Created:");
    console.log("├─ Admin: admin@carmarket.com / 123456Tien@");
    console.log("├─ Inspector: inspector@carmarket.com / 123456Tien@");
    console.log("├─ Seller 1: seller1@demo.com / 123456Tien@ (Bank verified)");
    console.log("├─ Seller 2: seller2@demo.com / 123456Tien@ (Bank verified)");
    console.log(
      "├─ Seller 3: seller3@demo.com / 123456Tien@ (Bank NOT verified)"
    );
    console.log("├─ Buyer 1: buyer1@demo.com / 123456Tien@");
    console.log("├─ Buyer 2: buyer2@demo.com / 123456Tien@");
    console.log("└─ Buyer 3: buyer3@demo.com / 123456Tien@");
    console.log("\n📊 Data Summary:");
    const userCount = await User.countDocuments();
    const categoryCount = await Category.countDocuments();
    const carCount = await Car.countDocuments();
    console.log(`├─ Users: ${userCount}`);
    console.log(`├─ Categories: ${categoryCount}`);
    console.log(`└─ Cars: ${carCount}`);

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
