const mongoose = require("mongoose");

const RideSchema = new mongoose.Schema({
  fromWhere: {
    type: String,
    required: true,
  },
  toWhere: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  noOfSeats: {
    type: Number,
    required: true,
  },
  journeyTime: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Ride", RideSchema);
