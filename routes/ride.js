// Import the required modules
const express = require("express");
const router = express.Router();

const { createRide, addStopPoint, deleteRide } = require("../controllers/Ride");
const { auth } = require("../middlewares/auth");

router.post("/createRide", auth, createRide);
router.put("/addStopPoint", auth, addStopPoint);
router.put("/deleteRide", auth, deleteRide);

module.exports = router;
