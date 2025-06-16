const express = require("express");
const cors = require("cors");
const cleanupUnverifiedUsers = require("./shared/utils/unverifiedCleanup");
const cookieParser = require("cookie-parser");
const {
  maintenanceMiddleware,
  healthCheckHandler,
} = require("./shared/middleware/maintenance");

// server socket
const { createServer } = require("http");
const { Server } = require("socket.io");

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
  socket.on("user-online", (userId) => {
    onlineUsers.set(userId, socket.id);
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

// Auth routes - ALWAYS accessible (even during maintenance)
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/oauth", OauthRoutes);

// Maintenance middleware - applies to all routes EXCEPT auth
app.use(maintenanceMiddleware);

// Other routes - protected by maintenance middleware
app.use("/api/v1/thread", threadRoutes);
app.use("/api/v1/requestAdd", RequestFormRoutes);
// app.use("/api/v1/admin", require("./admin/routes"));
app.use("/api/v1/car", CarRoutes);
app.use("/api/v1/user", UserRoutes);
app.use("/api/v1/statistic", StatisticRoutes);
// app.use("/api/v1/payment", require("./payment/routes"));
app.use("/api/v1/category", categoryRoutes);

//  global error handler
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// start server
const PORT = process.env.PORT || 5000;
const startSever = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} `);
  });
};
startSever();
