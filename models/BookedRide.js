const mongoose = require("mongoose");

const BookRideSchema = new mongoose.Schema({
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
  travellers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
  ],
});

module.exports = mongoose.model("BookedRide", BookRideSchema);
