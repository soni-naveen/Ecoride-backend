// Import the required modules
const express = require("express");
const router = express.Router();

const { createRide, addStopPoint } = require("../controllers/Ride");
const { auth } = require("../middlewares/auth");

router.post("/createRide", auth, createRide);
// router.post("/addStopPoint", auth, addStopPoint);

module.exports = router;
