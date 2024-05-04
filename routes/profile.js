const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const {
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

router.delete("/deleteProfile", auth, deleteAccount);
router.put("/completeProfile", completeProfile);
router.put("/updateProfile", auth, updateProfile);
router.get("/getUserDetails", auth, getAllUserDetails);

// Get Enrolled Courses
// router.get("/getEnrolledCourses", auth, getEnrolledCourses);
// router.put("/updateDisplayPicture", auth, updateDisplayPicture);
// router.get("/instructorDashboard", auth, isInstructor, instructorDashboard);

module.exports = router;
