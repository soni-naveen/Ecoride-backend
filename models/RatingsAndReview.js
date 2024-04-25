const mongoose = require("mongoose");

const ratingsAndReview = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  rating: {
    type: Number,
    required: true,
  },
  review: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
});
