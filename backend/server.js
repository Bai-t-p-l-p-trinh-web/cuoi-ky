const express = require("express");
const cors = require("cors");

const connectDB = require("./shared/config/db");
require("dotenv").config();

const app = express();

// middleware
app.use(express.json());
app.use(cors());

// routes
const categoryRoutes = require('./category/category.routes');
const CarRoutes = require('./car/car.routes');

app.use("/api/v1/auth", require("./auth/auth.routes"));
// app.use("/api/v1/admin", require("./admin/routes"));
app.use("/api/v1/car", CarRoutes);
// app.use("/api/v1/user", require("./user/user.routes"));
// app.use("/api/v1/payment", require("./payment/routes"));
app.use('/api/v1/category', categoryRoutes);

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
