/**
 * Script để optimize database indexes và performance
 * Chạy: node scripts/optimize-database.js
 */

const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected for optimization");
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err.message);
    process.exit(1);
  }
};

const optimizeIndexes = async () => {
  console.log("🔄 Optimizing database indexes...");

  const db = mongoose.connection.db;

  try {
    // Car collection indexes
    await db.collection("cars").createIndex({ status: 1, deleted: 1 });
    await db.collection("cars").createIndex({ sellerId: 1, status: 1 });
    await db.collection("cars").createIndex({ price: 1 });
    await db.collection("cars").createIndex({ year: 1 });
    await db.collection("cars").createIndex({ km: 1 });
    await db.collection("cars").createIndex({ "fuel_use.fuel_type": 1 });
    await db.collection("cars").createIndex({ seat_capacity: 1 });
    await db.collection("cars").createIndex({ "location.query_location": 1 });
    await db.collection("cars").createIndex({ title: "text", comment: "text" }); // Text search
    await db.collection("cars").createIndex({ createdAt: -1 }); // Sort by newest
    console.log("✅ Car indexes created");

    // User collection indexes
    await db.collection("users").createIndex({ email: 1 });
    await db.collection("users").createIndex({ role: 1 });
    await db.collection("users").createIndex({ isVerified: 1 });
    await db.collection("users").createIndex({ slug: 1 });
    console.log("✅ User indexes created");

    // Order collection indexes
    await db.collection("orders").createIndex({ buyer: 1, status: 1 });
    await db.collection("orders").createIndex({ seller: 1, status: 1 });
    await db.collection("orders").createIndex({ orderCode: 1 });
    await db.collection("orders").createIndex({ createdAt: -1 });
    await db.collection("orders").createIndex({ status: 1 });
    console.log("✅ Order indexes created");

    // Request collection indexes
    await db.collection("request_adds").createIndex({ sellerId: 1, status: 1 });
    await db.collection("request_adds").createIndex({ status: 1 });
    await db.collection("request_adds").createIndex({ slug: 1 });
    await db.collection("request_adds").createIndex({ createdAt: -1 });
    console.log("✅ Request indexes created");

    // Payment collection indexes
    await db.collection("payments").createIndex({ orderId: 1 });
    await db.collection("payments").createIndex({ status: 1 });
    await db.collection("payments").createIndex({ paymentCode: 1 });
    await db.collection("payments").createIndex({ createdAt: -1 });
    console.log("✅ Payment indexes created");

    // Thread collection indexes (for chat)
    await db.collection("threads").createIndex({ userIds: 1 });
    await db.collection("threads").createIndex({ updatedAt: -1 });
    console.log("✅ Thread indexes created");

    // Notification collection indexes
    await db.collection("notifications").createIndex({ userId: 1, isRead: 1 });
    await db.collection("notifications").createIndex({ createdAt: -1 });
    console.log("✅ Notification indexes created");
  } catch (error) {
    console.error("❌ Error creating indexes:", error);
  }
};

const analyzePerformance = async () => {
  console.log("🔄 Analyzing database performance...");

  const db = mongoose.connection.db;

  try {
    // Analyze slow queries
    const stats = await db.admin().serverStatus();
    console.log("📊 Database Stats:");
    console.log(
      `- Connections: ${stats.connections.current}/${stats.connections.available}`
    );
    console.log(
      `- Network bytes in: ${Math.round(stats.network.bytesIn / 1024 / 1024)}MB`
    );
    console.log(
      `- Network bytes out: ${Math.round(
        stats.network.bytesOut / 1024 / 1024
      )}MB`
    );

    // Get collection stats
    const collections = ["cars", "users", "orders", "request_adds", "payments"];

    for (const collName of collections) {
      try {
        const collStats = await db.collection(collName).stats();
        console.log(`\n📋 ${collName} collection:`);
        console.log(`- Documents: ${collStats.count}`);
        console.log(
          `- Average document size: ${Math.round(collStats.avgObjSize)} bytes`
        );
        console.log(`- Total size: ${Math.round(collStats.size / 1024)}KB`);
        console.log(
          `- Storage size: ${Math.round(collStats.storageSize / 1024)}KB`
        );
        console.log(`- Indexes: ${collStats.nindexes}`);
        console.log(
          `- Index size: ${Math.round(collStats.totalIndexSize / 1024)}KB`
        );
      } catch (error) {
        console.log(`❌ Could not get stats for ${collName}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error("❌ Error analyzing performance:", error);
  }
};

const cleanupOldData = async () => {
  console.log("🔄 Cleaning up old data...");

  const db = mongoose.connection.db;

  try {
    // Clean up unverified users older than 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const deletedUsers = await db.collection("users").deleteMany({
      isVerified: false,
      createdAt: { $lt: sevenDaysAgo },
    });
    console.log(`✅ Deleted ${deletedUsers.deletedCount} unverified users`);

    // Clean up expired OTP records older than 1 day
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const deletedOTPs = await db.collection("otps").deleteMany({
      createdAt: { $lt: oneDayAgo },
    });
    console.log(`✅ Deleted ${deletedOTPs.deletedCount} expired OTP records`);

    // Clean up old notifications older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const deletedNotifications = await db
      .collection("notifications")
      .deleteMany({
        isRead: true,
        createdAt: { $lt: thirtyDaysAgo },
      });
    console.log(
      `✅ Deleted ${deletedNotifications.deletedCount} old notifications`
    );
  } catch (error) {
    console.error("❌ Error cleaning up data:", error);
  }
};

const optimizeDatabase = async () => {
  try {
    await connectDB();

    console.log("🚀 Starting database optimization...");

    await optimizeIndexes();
    await analyzePerformance();
    await cleanupOldData();

    console.log("🎉 Database optimization completed!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error optimizing database:", error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  optimizeDatabase();
}

module.exports = { optimizeDatabase };
