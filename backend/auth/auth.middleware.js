const jwt = require("jsonwebtoken");

exports.requireAuth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

exports.checkRole = (role) => (req, res, next) => {
  if (req.user?.role !== role)
    return res.status(403).json({ message: "Forbidden" });

  next();
};
