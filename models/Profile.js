const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
  },
  dateOfBirth: {
    type: String,
  },
  mobileNumber: {
    type: Number,
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
