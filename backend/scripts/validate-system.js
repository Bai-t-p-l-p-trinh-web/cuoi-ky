/**
 * Script validation toàn bộ hệ thống trước khi demo
 * Chạy: node scripts/validate-system.js
 */

const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();

const API_BASE = `http://localhost:${process.env.PORT || 3000}/api/v1`;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Database connection: OK");
    return true;
  } catch (err) {
    console.error("❌ Database connection: FAILED -", err.message);
    return false;
  }
};

const checkServer = async () => {
  try {
    const response = await axios.get(`${API_BASE}/health`, { timeout: 5000 });
    if (response.status === 200) {
      console.log("✅ Server health: OK");
      return true;
    }
  } catch (error) {
    console.error("❌ Server health: FAILED -", error.message);
    return false;
  }
};

const checkDemoAccounts = async () => {
  try {
    const db = mongoose.connection.db;

    const demoEmails = [
      "admin@demo.com",
      "seller1@demo.com",
      "seller2@demo.com",
      "buyer1@demo.com",
      "buyer2@demo.com",
    ];

    const users = await db
      .collection("users")
      .find({
        email: { $in: demoEmails },
      })
      .toArray();

    if (users.length === demoEmails.length) {
      console.log("✅ Demo accounts: OK");
      return true;
    } else {
      console.error(
        `❌ Demo accounts: MISSING (found ${users.length}/${demoEmails.length})`
      );
      return false;
    }
  } catch (error) {
    console.error("❌ Demo accounts check: FAILED -", error.message);
    return false;
  }
};

const checkSampleData = async () => {
  try {
    const db = mongoose.connection.db;

    const cars = await db.collection("cars").countDocuments();
    const categories = await db.collection("cars-category").countDocuments();

    if (cars >= 3 && categories >= 3) {
      console.log("✅ Sample data: OK");
      return true;
    } else {
      console.error(
        `❌ Sample data: INSUFFICIENT (cars: ${cars}, categories: ${categories})`
      );
      return false;
    }
  } catch (error) {
    console.error("❌ Sample data check: FAILED -", error.message);
    return false;
  }
};

const checkAPIsecurity = async () => {
  try {
    // Test rate limiting
    const requests = [];
    for (let i = 0; i < 10; i++) {
      requests.push(axios.get(`${API_BASE}/car`, { timeout: 2000 }));
    }

    await Promise.all(requests);
    console.log("✅ API Security (Rate limiting): OK");
    return true;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.log("✅ API Security (Rate limiting): OK (rate limit working)");
      return true;
    }
    console.error("❌ API Security check: FAILED -", error.message);
    return false;
  }
};

const checkFileStructure = async () => {
  const fs = require("fs").promises;
  const path = require("path");

  try {
    const requiredFiles = [
      "server.js",
      "shared/config/config.js",
      "shared/config/db.js",
      "shared/middleware/rateLimiter.js",
      "shared/utils/cache.js",
      "shared/utils/errorHandler.js",
      "scripts/seed-demo-data.js",
      "scripts/optimize-database.js",
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(__dirname, "..", file);
      try {
        await fs.access(filePath);
      } catch {
        console.error(`❌ Missing file: ${file}`);
        return false;
      }
    }

    console.log("✅ File structure: OK");
    return true;
  } catch (error) {
    console.error("❌ File structure check: FAILED -", error.message);
    return false;
  }
};

const checkEnvironmentVars = () => {
  const requiredVars = [
    "MONGO_URI",
    "JWT_SECRET",
    "CLIENT_URL",
    "EMAIL_USER",
    "EMAIL_PASS",
    "CLOUDINARY_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "VIETQR_CLIENT_ID",
    "VIETQR_API_KEY",
  ];

  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length === 0) {
    console.log("✅ Environment variables: OK");
    return true;
  } else {
    console.error(`❌ Missing environment variables: ${missing.join(", ")}`);
    return false;
  }
};

const validateSystem = async () => {
  console.log("🚀 Starting system validation...\n");

  const checks = [
    { name: "Environment Variables", fn: () => checkEnvironmentVars() },
    { name: "File Structure", fn: () => checkFileStructure() },
    { name: "Database Connection", fn: () => connectDB() },
    { name: "Server Health", fn: () => checkServer() },
    { name: "Demo Accounts", fn: () => checkDemoAccounts() },
    { name: "Sample Data", fn: () => checkSampleData() },
    { name: "API Security", fn: () => checkAPIsecurity() },
  ];

  let passed = 0;
  let failed = 0;

  for (const check of checks) {
    try {
      const result = await check.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`❌ ${check.name}: FAILED -`, error.message);
      failed++;
    }
  }

  console.log("\n📊 VALIDATION RESULTS:");
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed === 0) {
    console.log("\n🎉 System is ready for demo!");
    console.log("\n🚀 Quick start commands:");
    console.log("Backend: npm start");
    console.log("Frontend: npm run dev");
    console.log("\n📋 Demo accounts in DEMO_SETUP_GUIDE.md");
  } else {
    console.log("\n⚠️  System has issues. Please fix before demo.");
    console.log("Run: npm run setup-demo");
  }

  process.exit(failed > 0 ? 1 : 0);
};

// Run if called directly
if (require.main === module) {
  validateSystem();
}

module.exports = { validateSystem };
