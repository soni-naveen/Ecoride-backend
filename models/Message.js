const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: String,
    receiver: String,
    content: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 24 * 60 * 60,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Message", messageSchema);
