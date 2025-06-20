const mongoose = require("mongoose");

const notiUser = new mongoose.Schema(
  {
    userId : {
        type : String,
        required : true
    },
    content : {
        type : String,
        required : true
    }
  },
  {
    timestamps: true,
  }
);

const Notificate = mongoose.model("Notificate", notiUser, "notices");

module.exports = Notificate;
