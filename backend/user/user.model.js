const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      default: null,
    },
    pendingEmail: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "seller", "staff" , "admin"], 
      default: "user",
    },
    address: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
    },
    district: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // no longer used
    // telegramUserId: {
    //   type: String,
    //   default: null,
    // },
    is2FAEnabled: {
      type: Boolean,
      default: false,
    },
    CCCD: {
      type: String,
      default: null,
    },
    contactFacebook: {
      type: String,
      default: null,
    },
    contactZalo: {
      type: String,
      default: null,
    },
    contactEmail: {
      type: String,
      default: null,
    },
    contactLinkedin: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
