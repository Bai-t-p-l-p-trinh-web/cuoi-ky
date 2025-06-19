/**
 * Application configuration
 * Centralized environment variables management
 */

require("dotenv").config();

const config = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT) || 5000,
  // Database
  MONGODB_URI:
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/car_marketplace",

  // JWT
  JWT: {
    SECRET: process.env.JWT_SECRET || "your-super-secret-jwt-key",
    EXPIRES_IN: process.env.JWT_EXPIRE || process.env.JWT_EXPIRES_IN || "7d",
    REFRESH_SECRET:
      process.env.REFRESH_TOKEN_SECRET ||
      process.env.JWT_REFRESH_SECRET ||
      "your-refresh-secret",
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },

  // Client
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  // Email
  EMAIL: {
    SERVICE: process.env.EMAIL_SERVICE || "gmail",
    USER: process.env.EMAIL_USER || process.env.SMTP_USER || "",
    PASS: process.env.EMAIL_PASS || process.env.SMTP_PASS || "",
    HOST: process.env.SMTP_HOST || "smtp.gmail.com",
    PORT: parseInt(process.env.SMTP_PORT) || 587,
  },

  // Cloudinary
  CLOUDINARY: {
    CLOUD_NAME:
      process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME || "",
    API_KEY: process.env.CLOUDINARY_API_KEY || "",
    API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  },
  // VietQR
  VIETQR: {
    API_URL: process.env.VIETQR_API_URL || "https://api.vietqr.io",
    CLIENT_ID: process.env.VIETQR_CLIENT_ID || "",
    API_KEY: process.env.VIETQR_API_KEY || "",
  },

  // System Bank Account (for receiving payments)
  SYSTEM_BANK: {
    CODE: process.env.SYSTEM_BANK_CODE || "",
    NAME: process.env.SYSTEM_BANK_NAME || "",
    ACCOUNT_NUMBER: process.env.SYSTEM_BANK_ACCOUNT_NUMBER || "",
    ACCOUNT_NAME: process.env.SYSTEM_BANK_ACCOUNT_NAME || "",
  },

  // Telegram
  TELEGRAM: {
    BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "",
    CHAT_ID: process.env.TELEGRAM_CHAT_ID || "",
  },

  // OTP
  OTP: {
    EXPIRES_IN: parseInt(process.env.OTP_EXPIRES_IN) || 300000, // 5 minutes
    LENGTH: parseInt(process.env.OTP_LENGTH) || 6,
  },
  // Google OAuth
  GOOGLE_OAUTH: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID?.replace(/"/g, "") || "",
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET?.replace(/"/g, "") || "",
    CALLBACK_URL:
      process.env.GOOGLE_AUTHORIZED_REDIRECT_URI ||
      process.env.GOOGLE_CALLBACK_URL ||
      "http://localhost:5000/api/v1/oauth/google/callback",
  },

  // System Configuration
  SYSTEM: {
    LOGO_URL: process.env.LOGO_URL || "",
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || "",
  },

  // Maintenance
  MAINTENANCE_MODE: process.env.MAINTENANCE_MODE === "true",

  // Rate Limiting
  RATE_LIMIT: {
    MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  },

  // Session
  SESSION: {
    SECRET: process.env.SESSION_SECRET || "your-session-secret",
    MAX_AGE: parseInt(process.env.SESSION_MAX_AGE) || 86400000, // 24 hours
  },

  // File Upload
  FILE_UPLOAD: {
    MAX_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    ALLOWED_TYPES: process.env.ALLOWED_FILE_TYPES?.split(",") || [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
    ],
  },

  // Validation
  isDevelopment: () => config.NODE_ENV === "development",
  isProduction: () => config.NODE_ENV === "production",
  isTest: () => config.NODE_ENV === "test",
  // Required environment variables check
  validateRequiredEnvVars: () => {
    const required = ["MONGO_URI", "JWT_SECRET", "CLIENT_URL"];

    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`
      );
    }
  },
};

module.exports = config;
