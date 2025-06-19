const mongoose = require("mongoose");
const slugUpdater = require("mongoose-slug-updater");
const LocationEnum = require("../constants/locationEnum");
const allowedLocations = Object.values(LocationEnum).map(
  (l) => l.query_location
);

mongoose.plugin(slugUpdater);

const carSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      default: "",
    },
    model: {
      type: String,
      default: "",
    },
    category_id: {
      type: String,
      default: "",
    },
    location: {
      query_location: {
        type: String,
        enum: allowedLocations,
        default: "",
      },
      query_name: {
        type: String,
        default: "",
      },
    },
    price: {
      type: Number,
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
      default: "gasoline",
    },
    fuel_use: {
      fuel_type: {
        type: String,
        enum: ["gasoline", "oil", "electric"],
        required: true,
      },
      fuel_name: {
        type: String,
        required: true,
      },
    },
    seat_capacity: {
      type: Number,
      required: true,
    },
    comment: String,
    description: String,
    img_src: Array,
    img_demo: String,
    slug: {
      type: String,
      slug: "title",
      // Removed duplicate unique: true - handled by plugin
    },
    sellerId: {
      type: String,
      required: true,
    },
    // Thông tin ngân hàng của seller để nhận tiền
    sellerBankInfo: {
      bankName: {
        type: String,
        required: true,
      },
      bankCode: {
        type: String,
        required: true,
      },
      accountNumber: {
        type: String,
        required: true,
      },
      accountHolder: {
        type: String,
        required: true,
      },
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["selling", "deposited", "hidden", "sold"],
      default: "selling",
    },
    time_sold: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance optimization
carSchema.index({ status: 1, deleted: 1 }); // For listing active cars
carSchema.index({ sellerId: 1, status: 1 }); // For seller's cars
carSchema.index({ price: 1 }); // For price range queries
carSchema.index({ year: 1 }); // For year range queries
carSchema.index({ km: 1 }); // For km range queries
carSchema.index({ "fuel_use.fuel_type": 1 }); // For fuel type filtering
carSchema.index({ seat_capacity: 1 }); // For seat capacity filtering
carSchema.index({ "location.query_location": 1 }); // For location filtering
carSchema.index({ title: "text", brand: "text", model: "text" }); // For text search
carSchema.index({ createdAt: -1 }); // For sorting by newest
carSchema.index({ slug: 1 }, { unique: true }); // For unique slug access

const Car = mongoose.model("Car", carSchema, "cars");

module.exports = Car;
