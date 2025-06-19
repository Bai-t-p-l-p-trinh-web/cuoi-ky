const mongoose = require("mongoose");
const slugUpdater = require("mongoose-slug-updater");

mongoose.plugin(slugUpdater);

const requestAddSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    km: {
      type: Number,
      required: true,
    },
    fuel: {
      type: String,
      enum: ["gasoline", "oil", "electric"],
      required: true,
    },
    seat_capacity: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    img_demo: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "checked", "done", "reject"],
      default: "pending",
      required: true,
    },
    img_src: Array,
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    slug: {
      type: String,
      slug: "name",
      // Removed duplicate unique: true - handled by plugin
    },
    userIds: Array,
    price_recommend_low: Number,
    price_recommend_high: Number,
    message: String,
    secure_url: String,
    examine: {
      isCorrectName: {
        type: Boolean,
        default: true,
      },
      isCorrectYear: {
        type: Boolean,
        default: true,
      },
      isCorrectKm: {
        type: Boolean,
        default: true,
      },
      isCorrectSeat_Capacity: {
        type: Boolean,
        default: true,
      },
      isFuel_Gasoline: {
        type: Boolean,
        default: true,
      },
      isFuel_Oil: {
        type: Boolean,
        default: false,
      },
      isFuel_Electric: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

const RequestAdd = mongoose.model(
  "RequestAdd",
  requestAddSchema,
  "request_adds"
);

module.exports = RequestAdd;
