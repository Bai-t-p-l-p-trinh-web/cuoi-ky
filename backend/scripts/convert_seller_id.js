const mongoose = require("mongoose");
const RequestAdd = require("../requestAdd/request_add.model");

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect("put db uri here", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Convert sellerId from string to ObjectId
const convertSellerIds = async () => {
  try {
    console.log("🔄 Starting sellerId conversion...");

    // Get native MongoDB collection to avoid Mongoose auto-conversion
    const db = mongoose.connection.db;
    const collection = db.collection("requestadds"); // Mongoose tự động pluralize tên collection

    // Check all collections first
    const collections = await db.listCollections().toArray();
    console.log(
      "📋 Available collections:",
      collections.map((c) => c.name)
    );

    // Find the correct collection name
    let correctCollectionName = null;
    for (const col of collections) {
      if (col.name.includes("request")) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`📊 Collection '${col.name}': ${count} documents`);
        if (count > 0) {
          correctCollectionName = col.name;
        }
      }
    }

    if (!correctCollectionName) {
      console.log("❌ No request collection found with data");
      return;
    }

    const requestCollection = db.collection(correctCollectionName);

    // Find all requests with string sellerId using native MongoDB query
    const requests = await requestCollection
      .find({
        sellerId: { $exists: true, $ne: null, $type: "string" },
      })
      .toArray();

    console.log(
      `📊 Found ${requests.length} requests with string sellerId to process`
    );

    // Also check total requests
    const totalRequests = await requestCollection.countDocuments({
      sellerId: { $exists: true, $ne: null },
    });
    console.log(`📊 Total requests with sellerId: ${totalRequests}`);

    // Show sample data
    if (totalRequests > 0) {
      const sampleRequest = await requestCollection.findOne({
        sellerId: { $exists: true, $ne: null },
      });
      console.log(
        "📋 Sample request sellerId:",
        sampleRequest.sellerId,
        "(type:",
        typeof sampleRequest.sellerId,
        ")"
      );
    }

    let convertedCount = 0;
    let errorCount = 0;

    for (const request of requests) {
      try {
        // Check if sellerId is a valid ObjectId string
        if (mongoose.Types.ObjectId.isValid(request.sellerId)) {
          // Convert string to ObjectId
          const objectId = new mongoose.Types.ObjectId(request.sellerId);

          // Update using native MongoDB
          await requestCollection.updateOne(
            { _id: request._id },
            { $set: { sellerId: objectId } }
          );

          convertedCount++;
          console.log(
            `✅ Converted request ${request._id}: ${request.sellerId} -> ObjectId`
          );
        } else {
          console.log(
            `⚠️  Request ${request._id} has invalid sellerId: ${request.sellerId}`
          );
          errorCount++;
        }
      } catch (error) {
        console.error(
          `❌ Error processing request ${request._id}:`,
          error.message
        );
        errorCount++;
      }
    }

    console.log(`\n📈 Conversion Summary:`);
    console.log(`✅ Successfully converted: ${convertedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total processed: ${requests.length}`);
  } catch (error) {
    console.error("❌ Error during conversion:", error);
  }
};

// Verify conversion
const verifyConversion = async () => {
  try {
    console.log("\n🔍 Verifying conversion...");

    // Use native MongoDB to check actual types
    const db = mongoose.connection.db;

    // Find the correct collection name
    const collections = await db.listCollections().toArray();
    let correctCollectionName = null;
    for (const col of collections) {
      if (col.name.includes("request")) {
        const count = await db.collection(col.name).countDocuments();
        if (count > 0) {
          correctCollectionName = col.name;
          break;
        }
      }
    }

    if (!correctCollectionName) {
      console.log("❌ No request collection found");
      return;
    }

    const requestCollection = db.collection(correctCollectionName);

    const stringSellerIds = await requestCollection.countDocuments({
      sellerId: { $type: "string" },
    });

    const objectIdSellerIds = await requestCollection.countDocuments({
      sellerId: { $type: "objectId" },
    });

    const totalRequests = await requestCollection.countDocuments({
      sellerId: { $exists: true, $ne: null },
    });

    console.log(`📊 Verification Results:`);
    console.log(`🔤 String sellerId: ${stringSellerIds}`);
    console.log(`🆔 ObjectId sellerId: ${objectIdSellerIds}`);
    console.log(`📋 Total requests with sellerId: ${totalRequests}`);

    if (stringSellerIds === 0 && objectIdSellerIds > 0) {
      console.log(`✅ All sellerId fields are now ObjectId!`);
    } else if (stringSellerIds > 0) {
      console.log(`⚠️  Still have ${stringSellerIds} string sellerId fields`);
    } else {
      console.log(`❌ No sellerId fields found`);
    }
  } catch (error) {
    console.error("❌ Error during verification:", error);
  }
};

// Main function
const main = async () => {
  try {
    await connectDB();

    console.log("🚀 Starting sellerId conversion script...\n");

    // Show current state
    await verifyConversion();

    console.log("\n" + "=".repeat(50));

    // Convert sellerId fields
    await convertSellerIds();

    console.log("\n" + "=".repeat(50));

    // Verify results
    await verifyConversion();

    console.log("\n✅ Script completed successfully!");
  } catch (error) {
    console.error("❌ Script failed:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("🔒 Database connection closed");
    process.exit(0);
  }
};

// Run the script
main();
