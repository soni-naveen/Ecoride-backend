const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const {
  fullProfile,
  deleteAccount,
  updateProfile,
  getAllUserDetails,
  completeProfile,
  // updateDisplayPicture,
  //   getEnrolledCourses,
  //   instructorDashboard,
} = require("../controllers/Profile");

// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************

router.get("/fullprofile/:id", fullProfile);
router.delete("/deleteProfile", auth, deleteAccount);
router.put("/completeProfile", auth, completeProfile);
router.put("/updateProfile", auth, updateProfile);
router.get("/getUserDetails", auth, getAllUserDetails);

// Get Enrolled Courses
// router.get("/getEnrolledCourses", auth, getEnrolledCourses);
// router.put("/updateDisplayPicture", auth, updateDisplayPicture);
// router.get("/instructorDashboard", auth, isInstructor, instructorDashboard);

module.exports = router;
