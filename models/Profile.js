const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  dateOfBirth: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: Number,
    required: true,
    trim: true,
  },
  govtId: {
    type: String,
  },
  bio: {
    type: String,
  },
  vehicle: {
    type: String,
  },
  dateJoined: {
    type: String,
  },
  noOfRidesPublished: {
    type: Number,
  },
  overallRating: {
    type: Number,
  },
  drivingRating: {
    type: Number,
  },
});

module.exports = mongoose.model("Profile", profileSchema);
