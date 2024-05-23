const mongoose = require("mongoose");

const RideSchema = new mongoose.Schema({
  fromWhere: {
    type: String,
  },
  toWhere: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  noOfSeats: {
    type: Number,
  },
  journeyTime: {
    type: String,
  },
  price: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  stopPoints: [
    {
      type: String,
    },
  ],
});

module.exports = mongoose.model("Ride", RideSchema);
