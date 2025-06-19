const jwt = require("jsonwebtoken");
const User = require("../user/user.model");

exports.requireAuth = async (req, res, next) => {
  let token;

  // Đọc token từ Authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Nếu không có token trong header, thử đọc từ cookies
  if (!token && req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Token decoded:", decode);

    // Fetch user từ database để có đầy đủ thông tin
    const user = await User.findById(decode.id || decode._id || decode.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user._id,
      _id: user._id,
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    console.log("User set in req:", req.user);
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
};

exports.checkRole = (role) => (req, res, next) => {
  if (req.user?.role !== role)
    return res.status(403).json({ message: "Forbidden" });

  next();
};

exports.requireAdmin = async (req, res, next) => {
  try {
    console.log("RequireAdmin middleware - checking userId:", req.userId);

    if (!req.userId) {
      console.log("No userId found in request");
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    const user = await User.findById(req.userId);
    console.log(
      "User found:",
      user ? { id: user._id, role: user.role, name: user.name } : null
    );

    if (!user) {
      console.log("User not found in database");
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    if (user.role !== "admin") {
      console.log("User is not admin:", user.role);
      return res.status(403).json({
        success: false,
        message: "Chỉ admin mới có quyền thực hiện thao tác này",
      });
    }

    console.log("Admin check passed");
    req.user = user; // Đặt user vào req để sử dụng sau này
    next();
  } catch (error) {
    console.error("Error in requireAdmin middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi kiểm tra quyền admin",
      error: error.message,
    });
  }
};

exports.verifyAdmin = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin mới có quyền thực hiện thao tác này",
      });
    }

    req.user = user; // Đặt user vào req để sử dụng sau này
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi kiểm tra quyền admin",
      error: error.message,
    });
  }
};
