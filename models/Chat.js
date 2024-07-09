const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
    chatLink: String,
  },
  { versionKey: false }
);

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
