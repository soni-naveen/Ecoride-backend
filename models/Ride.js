const mongoose = require("mongoose");

const RideSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  fromWhere: {
    type: String,
  },
  toWhere: {
    type: String,
  },
  date: {
    type: String,
  },
  leavingTime: {
    type: String,
  },
  reachingTime: {
    type: String,
  },
  noOfSeats: {
    type: Number,
  },
  price: {
    type: Number,
  },
  stopPoint1: {
    type: String,
  },
  stopPoint2: {
    type: String,
  },
  stopPoint3: {
    type: String,
  },
});

module.exports = mongoose.model("Ride", RideSchema);
