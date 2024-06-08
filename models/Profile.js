const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  dateOfBirth: {
    type: String,
  },
  gender: {
    type: String,
  },
  contactNumber: {
    type: String,
    trim: true,
  },
  govtId: {
    type: String,
  },
  about: {
    type: String,
  },
  vehicle: {
    type: String,
  },
  dateJoined: {
    type: Date,
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
