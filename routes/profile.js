const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const {
  fullProfile,
  deleteAccount,
  updateProfile,
  myProfileAbout,
  getAllUserDetails,
  completeProfile,
  updateDisplayPicture,
  verifyProfile,
} = require("../controllers/Profile");

// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************

router.get("/fullprofile/:profileId", fullProfile);
router.delete("/deleteProfile", auth, deleteAccount);
router.put("/completeProfile", auth, completeProfile);
router.put("/updateProfile", auth, updateProfile);
router.put("/updateDisplayPicture", auth, updateDisplayPicture);
router.put("/verifyProfile", auth, verifyProfile);
router.put("/myProfileAbout", auth, myProfileAbout);
router.get("/getUserDetails", auth, getAllUserDetails);

// Get Enrolled Courses
// router.get("/getEnrolledCourses", auth, getEnrolledCourses);
// router.get("/instructorDashboard", auth, isInstructor, instructorDashboard);

module.exports = router;
