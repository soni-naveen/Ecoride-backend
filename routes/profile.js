const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const {
  deleteAccount,
  updateProfile,
  myProfileAbout,
  getAllUserDetails,
  completeProfile,
  updateDisplayPicture,
  verifyProfile,
  fullProfile,
  getInboxMessages,
  deleteInboxMessage,
} = require("../controllers/Profile");

// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************

router.post("/fullProfile", fullProfile);
router.post("/getInboxMessages", getInboxMessages);
router.post("/deleteInboxMessage", auth, deleteInboxMessage);
router.get("/getUserDetails", auth, getAllUserDetails);
router.put("/completeProfile", auth, completeProfile);
router.put("/updateProfile", auth, updateProfile);
router.put("/updateDisplayPicture", auth, updateDisplayPicture);
router.put("/verifyProfile", auth, verifyProfile);
router.put("/myProfileAbout", auth, myProfileAbout);
router.delete("/deleteProfile", auth, deleteAccount);

// Get Enrolled Courses
// router.get("/getEnrolledCourses", auth, getEnrolledCourses);
// router.get("/instructorDashboard", auth, isInstructor, instructorDashboard);

module.exports = router;
