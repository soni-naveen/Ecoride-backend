const mongoose = require("mongoose");

const BookRideSchema = new mongoose.Schema(
  {
    email: {
      type: String,
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
    },
    rideStatus: {
      type: String,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("BookedRide", BookRideSchema);
