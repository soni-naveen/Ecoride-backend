const mongoose = require("mongoose");

const ridePublished = new mongoose.Schema({
  fromWhere: {
    type: String,
    required: true,
  },
  toWhere: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  noOfseats: {
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
  stopPoints: {
    type: String,
  },
});

module.exports = mongoose.model("ridePublished", ridePublished);
