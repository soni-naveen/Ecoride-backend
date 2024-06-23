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
  cancelBookedRide,
} = require("../controllers/Ride");
const { auth } = require("../middlewares/auth");

router.post("/getSearchedRides", getSearchedRides);
router.post("/getRideDetails", getRideDetails);
router.post("/sendBookRequest", auth, sendBookRequest);
router.post("/createRide", auth, createRide);
router.put("/deleteRide", auth, deleteRide);
router.put("/autoDeleteRide", auth, autoDeleteRide);
router.put("/cancelBookedRide", auth, cancelBookedRide);

module.exports = router;
