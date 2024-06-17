// Import the required modules
const express = require("express");
const router = express.Router();

const {
  createRide,
  deleteRide,
  getSearchedRides,
  getRideDetails,
  autoDeleteRide,
} = require("../controllers/Ride");
const { auth } = require("../middlewares/auth");

router.post("/getSearchedRides", getSearchedRides);
router.post("/getRideDetails", getRideDetails);
router.post("/createRide", auth, createRide);
router.put("/deleteRide", auth, deleteRide);
router.put("/autoDeleteRide", auth, autoDeleteRide);

module.exports = router;
