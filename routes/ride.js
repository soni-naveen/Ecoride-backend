// Import the required modules
const express = require("express");
const router = express.Router();

const {
  createRide,
  deleteRide,
  getSearchedRides,
  getRideDetails,
  autoDeleteRide,
  sendBookRequest,
  confirmBooking,
  cancelPendingBooking,
  cancelConfirmedBooking,
  cancelBookedRide,
  getBookedRideDetails,
} = require("../controllers/Ride");
const { auth } = require("../middlewares/auth");

router.post("/getSearchedRides", getSearchedRides);
router.post("/getRideDetails", getRideDetails);
router.post("/getBookedRideDetails", getBookedRideDetails);
router.post("/sendBookRequest", auth, sendBookRequest);
router.post("/confirmBooking", auth, confirmBooking);
router.post("/cancelPendingBooking", auth, cancelPendingBooking);
router.post("/cancelConfirmedBooking", auth, cancelConfirmedBooking);
router.post("/createRide", auth, createRide);
router.put("/deleteRide", auth, deleteRide);
router.put("/autoDeleteRide", auth, autoDeleteRide);
router.put("/cancelBookedRide", auth, cancelBookedRide);

module.exports = router;
