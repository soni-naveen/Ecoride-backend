const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    user1: String,
    user2 : String,
    chatLink: String,
  },
  { versionKey: false }
);

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
