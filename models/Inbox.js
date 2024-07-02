const mongoose = require("mongoose");

const inboxSchema = new mongoose.Schema(
  {
    email: String,
    message: [
      {
        type: String,
      },
    ],
  },
  { versionKey: false }
);

const Inbox = mongoose.model("Inbox", inboxSchema);
module.exports = Inbox;
