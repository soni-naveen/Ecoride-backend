// The express.Router() function is used to create a new router object.

const express = require("express");
const router = express.Router();

//import controller
const { login, signup } = require("../controllers/Auth");

//define API routes
// router.post("/login", login);
router.post("/signup", signup);

//export
module.exports = router;
