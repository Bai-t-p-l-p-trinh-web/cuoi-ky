// Script fix lỗi duplicate key
const mongoose = require("mongoose");

async function fixDuplicateKey() {
  try {
    // Kết nối MongoDB
    await mongoose.connect("mongodb://localhost:27017/test");
    console.log("✅ Connected to MongoDB");

    // Xóa index problematic
    const db = mongoose.connection.db;

    try {
      await db.collection("payments").dropIndex("transactionId_1");
      console.log("✅ Dropped transactionId_1 index");
    } catch (error) {
      console.log("ℹ️ Index không tồn tại hoặc đã bị xóa");
    }

    // Xóa các payments có transactionId null để cleanup
    const result = await db.collection("payments").deleteMany({
      "transactionInfo.bankTransactionId": null,
    });
    console.log(
      `✅ Deleted ${result.deletedCount} payments with null transactionId`
    );

    console.log("🎉 Fix completed! Bây giờ có thể tạo payment mới.");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
  }
}

// Chạy fix
fixDuplicateKey();
