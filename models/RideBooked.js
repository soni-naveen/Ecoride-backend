const mongoose = require("mongoose");

const rideBooked = new mongoose.Schema({
  ridedetail: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RidePublished",
  },
  driverDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
  },
  bookingStatus: {
    type: String,
  },
});

module.exports = mongoose.model("rideBooked", rideBooked);
