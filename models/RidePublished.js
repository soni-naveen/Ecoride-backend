const mongoose = require("mongoose");

const ridePublished = new mongoose.Schema({
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
  noOfseats: {
    type: Number,
  },
  journeyTime: {
    type: String,
  },
  price: {
    type: Number,
  },
  stopPoints: {
    type: String,
  },
});

module.exports = mongoose.model("ridePublished", ridePublished);
