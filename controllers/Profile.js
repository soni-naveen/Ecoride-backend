const mongoose = require("mongoose");
const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.completeProfile = async (req, res) => {
  try {
    const { firstName, lastName, gender, dateOfBirth, contactNumber } =
      req.body;

    const id = req.user.id;

    // Find the profile by id
    const userDetails = await User.findById(id);
    const profile = await Profile.findById(userDetails.additionalDetails);

    // Update the profile fields
    profile.firstName = firstName;
    profile.lastName = lastName;
    profile.dateOfBirth = dateOfBirth;
    profile.gender = gender;
    profile.contactNumber = contactNumber;

    // Save the updated profile
    await profile.save();

    const updatedImage = await User.findByIdAndUpdate(
      userDetails,
      {
        image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}&chars=1`,
      },
      { new: true }
    ).exec();

    // Find the updated user details
    const updatedUserDetails = await User.findByIdAndUpdate(id)
      .populate("additionalDetails")
      .exec();

    return res.json({
      success: true,
      message: "Profile completed successfully",
      updatedUserDetails,
      updatedImage,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, gender, contactNumber } =
      req.body;

    const id = req.user.id;

    // Find the profile by id
    const userDetails = await User.findById(id);
    const profile = await Profile.findById(userDetails.additionalDetails);

    // Update the profile fields
    profile.firstName = firstName;
    profile.lastName = lastName;
    profile.dateOfBirth = dateOfBirth;
    profile.gender = gender;
    profile.contactNumber = contactNumber;

    // Save the updated profile
    await profile.save();

    // Find the updated user details
    const updatedUserDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      updatedUserDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.myProfileAbout = async (req, res) => {
  try {
    const { about, vehicle } = req.body;

    const id = req.user.id;

    // Find the profile by id
    const userDetails = await User.findById(id);
    const profile = await Profile.findById(userDetails.additionalDetails);

    // Update the profile fields
    profile.about = about;
    profile.vehicle = vehicle;

    // Save the updated profile
    await profile.save();

    // Find the updated user details
    const updatedUserDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      updatedUserDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.fullProfile = async (req, res) => {
  const profileId = req.params.profileId;
  try {
    const profiles = await Profile.findById(profileId);
    console.log(profiles);
    res.json({
      success: true,
      message: "profiles",
      profiles,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const id = req.user.id;
    // console.log(id);
    const user = await User.findById({ _id: id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // Delete Assosiated Profile with the User
    await Profile.findByIdAndDelete({
      _id: new mongoose.Types.ObjectId(user.additionalDetails),
    });
    // for (const courseId of user.courses) {
    //   await Course.findByIdAndUpdate(
    //     courseId,
    //     { $pull: { studentsEnroled: id } },
    //     { new: true }
    //   );
    // }

    // Now Delete User
    await User.findByIdAndDelete({ _id: id });
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
    // await CourseProgress.deleteMany({ userId: id });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "User Cannot be deleted successfully" });
  }
};

exports.getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id;
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();
    // console.log(userDetails);
    res.status(200).json({
      success: true,
      message: "User Data fetched successfully",
      data: userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture;
    const userId = req.user.id;
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    );
    // console.log(image);
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    ).populate("additionalDetails");

    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
