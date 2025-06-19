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
      unique : true
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


const Car = mongoose.model("Car", carSchema, "cars");

module.exports = Car;
