const mongoose = require("mongoose");
const slugUpdater = require("mongoose-slug-updater");

mongoose.plugin(slugUpdater);

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
      enum: ["user", "seller", "staff", "admin"],
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
    //   default: null,    // },
    is2FAEnabled: {
      type: Boolean,
      default: false,
    },
    isOAuthUser: {
      type: Boolean,
      default: false,
    },
    hasSetPassword: {
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
    }, // Thông tin ngân hàng cho giao dịch
    bankAccount: {
      bankName: {
        type: String,
        default: null,
      },
      bankCode: {
        type: String,
        default: null,
      },
      accountNumber: {
        type: String,
        default: null,
      },
      accountName: {
        type: String,
        default: null,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      verifiedAt: {
        type: Date,
        default: null,
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },

    slug: {
      type: String,
      slug: "name",
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
