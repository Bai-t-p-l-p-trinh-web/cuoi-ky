const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "1d" }, // Token expires in 1 day
});

const UserToken = mongoose.model("UserToken", userTokenSchema);

module.exports = UserToken;
