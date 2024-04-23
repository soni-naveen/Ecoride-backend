// The express.Router() function is used to create a new router object.

const express = require("express");
const router = express.Router();

//import controller
const { login, signup } = require("../controllers/Auth");
const { auth } = require("../middlewares/auth");

//define API routes
router.post("/login", login);
router.post("/signup", signup);
router.get("/user", auth, (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the User Dashboard",
  });
});

//export
module.exports = router;
