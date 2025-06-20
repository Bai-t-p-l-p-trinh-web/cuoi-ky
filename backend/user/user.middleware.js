const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
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

  console.log(
    "Token from header:",
    req.headers.authorization
      ? req.headers.authorization.split(" ")[1]
      : "undefined"
  );
  // console.log(
  //   "Token from cookies:",
  //   req.cookies ? req.cookies.accessToken : "undefined"
  // );
  // console.log("Final token used:", token);

  if (!token) {
    return res.status(401).json({ message: "không có token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Lấy userId từ payload của token (có thể là id, userId, hoặc _id)
    req.userId = decoded.id || decoded.userId || decoded._id;

    if (!req.userId) {
      // console.error("User ID không tìm thấy trong token payload:", decoded);
      return res
        .status(401)
        .json({ message: "Token không hợp lệ: thiếu User ID" });
    }

    // console.log("Decoded userId:", req.userId);
    next();
  } catch (err) {
    // console.error("JWT verification error:", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token đã hết hạn" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
}

function verifyTokenButDontRequired(req, res, next) {
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
    return next(); // Không có token nhưng không bắt buộc, tiếp tục
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id || decoded.userId || decoded._id;
    next();
  } catch (err) {
    console.error(
      "JWT verification error (token không bắt buộc):",
      err.message
    );
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token đã hết hạn" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = {
  verifyToken,
  verifyTokenButDontRequired,
};
