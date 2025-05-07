const express = require("express");
const cors = require("cors");

const connectDB = require("./shared/config/db");
require("dotenv").config({ path: "./shared/config/.env" });

const app = express();

// middleware
app.use(express.json());
app.use(cors());

// routes
app.use("/api/v1/auth", require("./auth/routes"));
// app.use("/api/v1/admin", require("./admin/routes"));
// app.use("/api/v1/car", require("./car/routes"));
// app.use("/api/v1/user", require("./user/routes"));
// app.use("/api/v1/payment", require("./payment/routes"));

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
