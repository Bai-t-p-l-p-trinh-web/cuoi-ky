const express = require("express");
const cors = require("cors");
const cleanupUnverifiedUsers = require("./shared/utils/unverifiedCleanup");

const connectDB = require("./shared/config/db");
require("dotenv").config({ path: "./shared/config/.env" });

const app = express();

cleanupUnverifiedUsers(); // Start the cron job to clean up unverified users

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Added to parse URL-encoded bodies
app.use(cors());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log("Request Body:", req.body);
  next();
});

// routes
app.use("/api/v1/auth", require("./auth/auth.routes"));
// app.use("/api/v1/car", require("./car/routes"));
// app.use("/api/v1/user", require("./user/routes"));
// app.use("/api/v1/payment", require("./payment/routes"));
// app.use("/api/v1/category", require("./category/routes"));

//  global error handler
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// start server
const PORT = process.env.PORT || 5000;
const startSever = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
startSever();
