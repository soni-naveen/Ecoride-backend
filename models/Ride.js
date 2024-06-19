const mongoose = require("mongoose");

const RideSchema = new mongoose.Schema({
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
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
  confirmedPassengers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
  ],
  pendingPassengers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
  ],
});

module.exports = mongoose.model("Ride", RideSchema);
