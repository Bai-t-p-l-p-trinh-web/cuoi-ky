/**
 * Simple rate limiting middleware để ngăn chặn spam và abuse
 * Không cần external packages
 */

const config = require("../config/config");

// In-memory store cho rate limiting
const rateLimitStore = new Map();

// Cleanup expired entries mỗi 5 phút
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Tạo rate limiter với config tùy chỉnh
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 phút default
    max = 100, // 100 requests default
    message = "Too many requests",
    keyGenerator = (req) => req.ip,
    skipSuccessfulRequests = false,
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Get hoặc tạo entry cho key này
    let limitData = rateLimitStore.get(key);

    if (!limitData || now > limitData.resetTime) {
      // Tạo entry mới hoặc reset
      limitData = {
        count: 0,
        resetTime: now + windowMs,
        firstRequest: now,
      };
    }

    // Increment counter
    limitData.count += 1;
    rateLimitStore.set(key, limitData);

    // Check if exceeded limit
    if (limitData.count > max) {
      const retryAfter = Math.ceil((limitData.resetTime - now) / 1000);

      res.set({
        "X-RateLimit-Limit": max,
        "X-RateLimit-Remaining": 0,
        "X-RateLimit-Reset": new Date(limitData.resetTime).toISOString(),
        "Retry-After": retryAfter,
      });

      return res.status(429).json({
        error: typeof message === "string" ? message : message.error,
        retryAfter: retryAfter + " seconds",
      });
    }

    // Set headers
    res.set({
      "X-RateLimit-Limit": max,
      "X-RateLimit-Remaining": Math.max(0, max - limitData.count),
      "X-RateLimit-Reset": new Date(limitData.resetTime).toISOString(),
    });

    // Skip nếu là successful request và skipSuccessfulRequests = true
    if (skipSuccessfulRequests) {
      // Lưu original end method
      const originalEnd = res.end;
      res.end = function (...args) {
        // Nếu response thành công, giảm counter
        if (res.statusCode < 400) {
          const currentData = rateLimitStore.get(key);
          if (currentData) {
            currentData.count = Math.max(0, currentData.count - 1);
            rateLimitStore.set(key, currentData);
          }
        }
        originalEnd.apply(this, args);
      };
    }

    next();
  };
};

// Predefined rate limiters
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5,
  message: {
    error: "Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau 15 phút.",
  },
  keyGenerator: (req) => {
    // Safely get email from body, query, or default to IP only
    const email = req.body?.email || req.query?.email || "";
    return req.ip + ":" + email;
  },
  skipSuccessfulRequests: true,
});

const apiLimiter = createRateLimiter({
  windowMs: config.RATE_LIMIT.WINDOW_MS,
  max: config.RATE_LIMIT.MAX,
  message: {
    error: "Quá nhiều yêu cầu từ IP này. Vui lòng thử lại sau.",
  },
});

const uploadLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 phút
  max: 20,
  message: {
    error: "Quá nhiều yêu cầu upload. Vui lòng thử lại sau.",
  },
});

const createLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 phút
  max: 10,
  message: {
    error: "Quá nhiều yêu cầu tạo/cập nhật. Vui lòng thử lại sau.",
  },
});

const searchLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 60,
  message: {
    error: "Quá nhiều yêu cầu tìm kiếm. Vui lòng thử lại sau.",
  },
});

module.exports = {
  createRateLimiter,
  authLimiter,
  apiLimiter,
  uploadLimiter,
  createLimiter,
  searchLimiter,
};
