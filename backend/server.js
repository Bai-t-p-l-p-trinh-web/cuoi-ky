const express = require("express");
const cors = require("cors");
const cleanupUnverifiedUsers = require("./shared/utils/unverifiedCleanup");
const cookieParser = require("cookie-parser");
const orderReminderService = require("./utils/orderReminderService");
const socketUtils = require("./shared/utils/socket");
const {
  maintenanceMiddleware,
  healthCheckHandler,
} = require("./shared/middleware/maintenance");

// server socket
const { createServer } = require("http");
const { Server } = require("socket.io");

//swagger ui 
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

const connectDB = require("./shared/config/db");
require("dotenv").config();

const app = express();
const httpServer = createServer(app);

cleanupUnverifiedUsers(); // Start the cron job to clean up unverified users

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Added to parse URL-encoded bodies
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(cookieParser());

// socket io
const chatServices = require("./thread/thread.service");

const onlineUsers = new Map();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  // Set io instance when first connection is made
  if (!socketUtils.getIo()) {
    socketUtils.setIo(io);
  }

  socket.on("user-online", (userId) => {
    onlineUsers.set(userId, socket.id);

    // Join user to their notification room
    socket.join(`user_${userId}`);

    console.log(`✅ ${userId} đã online với socket ${socket.id}`);

    const onlineUserIds = Array.from(onlineUsers.keys());
    socket.emit("get-online-users", onlineUserIds);
    socket.broadcast.emit("get-one-online-user", userId);
  });

  socket.on("send-message", async (data) => {
    const { threadId, senderId, text } = data;

    const respondSending = await chatServices.sendMessages(
      threadId,
      senderId,
      text
    );

    // Lưu nội dung chat trong database
    if (respondSending.status) {
      console.log("gửi tin nhắn thành công!");
      socket.emit("send-messages-success", {
        threadId,
        senderId,
        text,
        msgId: respondSending.msgId,
        timestamp: respondSending.timestamp,
      });

      // Nếu người ta cũng online thì gửi tin nhắn trực tiếp đến
      const receiverId = respondSending.receiverId;
      if (onlineUsers.has(receiverId)) {
        const receiverSocketId = onlineUsers.get(receiverId);
        io.to(receiverSocketId).emit("send-messages-to-other", {
          threadId,
          senderId,
          text,
          msgId: respondSending.msgId,
          timestamp: respondSending.timestamp,
        });
      }
    } else {
      console.log("gửi tin nhắn thất bại!");
      socket.emit("send-messages-fail");
    }
  });

  socket.on("user-typing", async (data) => {
    const { userId, threadId } = data;
    const respondGetOtherUserId = await chatServices.findOtherUserIdByThreadId(
      userId,
      threadId
    );

    if (respondGetOtherUserId.status) {
      const receiverId = respondGetOtherUserId.receiverId;
      if (onlineUsers.has(receiverId)) {
        const receiverSocketId = onlineUsers.get(receiverId);
        io.to(receiverSocketId).emit("get-other-user-typing", {
          userId,
        });
      }
    }
  });

  socket.on("user-end-typing", async (data) => {
    const { userId, threadId } = data;
    const respondGetOtherUserId = await chatServices.findOtherUserIdByThreadId(
      userId,
      threadId
    );

    if (respondGetOtherUserId.status) {
      const receiverId = respondGetOtherUserId.receiverId;
      if (onlineUsers.has(receiverId)) {
        const receiverSocketId = onlineUsers.get(receiverId);
        io.to(receiverSocketId).emit("get-other-user-done-typing", {
          userId,
        });
      }
    }
  });

  socket.on("disconnect", (reason) => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId == socket.id) {
        onlineUsers.delete(userId);
        socket.broadcast.emit("get-user-disconnect", userId);
        console.log(`❌ User with Id ${userId} disconnected. Lý do: ${reason}`);
        break;
      }
    }
  });
});
// end socket io

// Request logging middleware
app.use((req, res, next) => {
  // console.log(`${req.method} ${req.path}`);
  // console.log("Request Body:", req.body);
  next();
});

// Health check endpoint - for frontend monitoring
app.get("/api/v1/health", healthCheckHandler);

// routes
const authRoutes = require("./auth/auth.routes");
const categoryRoutes = require("./category/category.routes");
const CarRoutes = require("./car/car.routes");
const OauthRoutes = require("./oauth/oauth.routes");
const UserRoutes = require("./user/user.routes");
const threadRoutes = require("./thread/thread.routes");
const RequestFormRoutes = require("./requestAdd/request_add.routes");
const StatisticRoutes = require("./statistics/statistics.routes");
const PaymentRoutes = require("./payment/payment.routes");
const OrderRoutes = require("./order/order.routes");
const RefundRoutes = require("./refund/refund.routes");
const NotificationRoutes = require("./notification/notification.routes");
const AdminRoutes = require("./admin/admin.routes");
const noticesUserRoutes = require('./notiUser/notiUser.routes');

// api docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));  

// Auth routes - ALWAYS accessible (even during maintenance)
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/oauth", OauthRoutes);

// Maintenance middleware - applies to all routes EXCEPT auth
app.use(maintenanceMiddleware);

// Other routes - protected by maintenance middleware
app.use("/api/v1/thread", threadRoutes);
app.use("/api/v1/requestAdd", RequestFormRoutes);
app.use("/api/v1/admin", AdminRoutes);
app.use("/api/v1/car", CarRoutes);
app.use("/api/v1/user", UserRoutes);
app.use("/api/v1/statistic", StatisticRoutes);
app.use("/api/v1/payment", PaymentRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/orders", OrderRoutes);
app.use("/api/v1/refunds", RefundRoutes);
app.use("/api/v1/notifications", NotificationRoutes);
app.use("/api/v1/notices", noticesUserRoutes);

//  global error handler
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({ error: "Internal Server Error " });
});

// start server
const PORT = process.env.PORT || 5000;
const startSever = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
startSever();
