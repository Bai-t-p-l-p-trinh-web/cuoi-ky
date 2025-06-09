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
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
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
      enum: ["user", "admin"], // C2C (Customer-to-Customer)
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
    contactFacebook : {
      type: String,
      default: null,
    },
    contactZalo : {
      type: String,
      default: null,
    },
    contactEmail : {
      type: String,
      default: null,
    },
    contactLinkedin : {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
