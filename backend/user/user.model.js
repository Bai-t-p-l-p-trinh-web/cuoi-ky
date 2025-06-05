const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  CCCD: String
  ,
  phone: String
  ,
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "seller", "admin"],
    default: "user",
  },
  avatar : String
},
{
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);
