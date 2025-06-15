const jwt = require("jsonwebtoken");

/**
 * Shared maintenance check function
 */
const checkMaintenanceMode = (req) => {
  if (process.env.MAINTENANCE_MODE !== "true") {
    return { isMaintenanceMode: false };
  }

  // Check if user is admin
  const token = req.headers.authorization;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role === "admin") {
        return { isMaintenanceMode: true, isAdmin: true };
      }
    } catch (error) {
      // Ignore invalid token
    }
  }

  return { isMaintenanceMode: true, isAdmin: false };
};

/**
 * Middleware to handle maintenance mode
 */
const maintenanceMiddleware = (req, res, next) => {
  console.log(
    "🔍 Maintenance middleware - Path:",
    req.path,
    "Method:",
    req.method
  );

  if (process.env.MAINTENANCE_MODE !== "true") {
    console.log("✅ Not in maintenance mode, allowing request");
    return next(); // Not in maintenance mode, allow all requests
  }

  console.log("🚧 In maintenance mode, checking access...");

  // Check if user is already authenticated as admin
  const token = req.headers.authorization;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role === "admin") {
        console.log("✅ Admin user authenticated, allowing access");
        return next(); // Admin user with valid token, allow access
      }
    } catch (error) {
      console.log("❌ Invalid token:", error.message);
    }
  }
  // During maintenance, allow login for everyone and health checks
  const isLoginEndpoint = req.path.endsWith("/login") && req.method === "POST";
  const isHealthEndpoint = req.path.endsWith("/health") && req.method === "GET";

  console.log(
    "🔍 Checking endpoints - Path:",
    req.path,
    "isLogin:",
    isLoginEndpoint,
    "isHealth:",
    isHealthEndpoint
  );

  if (isLoginEndpoint || isHealthEndpoint) {
    console.log("✅ Allowing login/health endpoint");
    return next(); // Allow all login attempts and health checks
  }

  console.log("❌ Blocking request during maintenance");
  // Block all other endpoints during maintenance for non-admin users
  return res.status(503).json({
    message: "🚧 Hệ thống đang bảo trì. Vui lòng quay lại sau.",
    maintenanceMode: true,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Health check handler
 */
const healthCheckHandler = (req, res) => {
  if (process.env.MAINTENANCE_MODE !== "true") {
    return res.status(200).json({
      status: "OK",
      maintenanceMode: false,
      timestamp: new Date().toISOString(),
    });
  }

  // Check if user is admin
  const token = req.headers.authorization;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role === "admin") {
        return res.status(200).json({
          status: "OK",
          maintenanceMode: true,
          adminAccess: true,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      // Invalid token, proceed with maintenance response
    }
  }

  // Non-admin users get maintenance response
  return res.status(503).json({
    message: "🚧 Hệ thống đang bảo trì. Vui lòng quay lại sau.",
    maintenanceMode: true,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  checkMaintenanceMode,
  maintenanceMiddleware,
  healthCheckHandler,
};
