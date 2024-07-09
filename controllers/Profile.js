const mongoose = require("mongoose");
const Profile = require("../models/Profile");
const User = require("../models/User");
const Ride = require("../models/Ride");
const BookedRide = require("../models/BookedRide");
const Inbox = require("../models/Inbox");
const Chat = require("../models/Chat");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const {
  deletedAccountInfoMail,
} = require("../mail/templates/deletedAccountInfoMail");
const { accountDeletedMail } = require("../mail/templates/accountDeletedMail");
const mailSender = require("../utils/mailSender");

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

    const updatedImage = await Profile.findByIdAndUpdate(
      profile,
      {
        image: `https://api.dicebear.com/9.x/initials/svg?seed=${firstName}&chars=1`,
      },
      { new: true }
    ).exec();

    // Find the updated user details
    const updatedUserDetails = await User.findByIdAndUpdate(id)
      .populate("additionalDetails")
      .populate("ridePublished")
      .populate("rideBooked")
      .populate("inbox")
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
    const updatedUserDetails = await User.findByIdAndUpdate(id)
      .populate("additionalDetails")
      .populate("ridePublished")
      .populate("rideBooked")
      .populate("inbox")
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
      .populate("ridePublished")
      .populate("rideBooked")
      .populate("inbox")
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
  try {
    const { profileId } = req.body;

    const profileDetails = await Profile.findById(profileId);

    if (!profileDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find profile with id: ${profileId}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: profileDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id;

    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .populate({
        path: "ridePublished",
        populate: [
          { path: "pendingPassengers" },
          { path: "confirmedPassengers" },
        ],
      })
      .populate({
        path: "rideBooked",
        populate: [{ path: "profile" }, { path: "ride" }],
      })
      .populate("inbox")
      .exec();

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "User doesn't exists",
      });
    }

    return res.status(200).json({
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
    const id = req.user.id;

    const userId = await User.findById(id);
    const profile = await Profile.findById(userId.additionalDetails);

    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    );

    profile.image = image.secure_url;
    await profile.save();

    const userDetails = await User.findById(userId)
      .populate("additionalDetails")
      .populate("ridePublished")
      .populate("rideBooked")
      .populate("inbox")
      .exec();

    res.status(200).json({
      success: true,
      message: `Image Updated successfully`,
      data: userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.verifyProfile = async (req, res) => {
  try {
    const verifyProfile = req.files.verifyProfile;
    const userId = req.user.id;

    const image = await uploadImageToCloudinary(
      verifyProfile,
      process.env.FOLDER_NAME,
      1000,
      1000
    );
    const userDetails = await User.findById(userId);
    const profile = await Profile.findById(userDetails.additionalDetails);

    profile.govtId = "Pending";

    await profile.save();

    const updatedProfile = await User.findById(userId)
      .populate("additionalDetails")
      .populate("ridePublished")
      .populate("rideBooked")
      .populate("inbox")
      .exec();

    return res.json({
      success: true,
      updatedProfile,
      message: `Profile Verification`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getInboxMessages = async (req, res) => {
  try {
    const inboxId = req.body.inboxId;

    const inbox = await Inbox.findById(inboxId);

    if (!inbox) {
      return res.status(400).json({
        success: false,
        message: `Could not fetch messages.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: inbox,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getChats = async (req, res) => {
  try {
    const id = req.user.id;
    const userDetails = await User.findById(id);

    const chats = await Chat.find({
      $or: [
        { user1: userDetails.additionalDetails },
        { user2: userDetails.additionalDetails },
      ],
    })
      .populate("user1")
      .populate("user2");

    if (!chats || chats.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Could not fetch messages.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: chats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.deleteInboxMessage = async (req, res) => {
  try {
    const id = req.user.id;
    const msg = req.body.msg;

    const user = await User.findById(id);

    const inbox = await Inbox.findById(user.inbox);

    if (!inbox) {
      return res.status(400).json({
        success: false,
        message: `Could not fetch messages.`,
      });
    }

    await Inbox.findByIdAndUpdate(
      inbox,
      {
        $pull: { message: msg },
      },
      { new: true }
    );

    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .populate({
        path: "ridePublished",
        populate: [
          { path: "pendingPassengers" },
          { path: "confirmedPassengers" },
        ],
      })
      .populate({
        path: "rideBooked",
        populate: [{ path: "profile" }, { path: "ride" }],
      })
      .populate("inbox")
      .exec();

    return res.status(200).json({
      success: true,
      data: userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const id = req.user.id;
    // console.log(id);
    const user = await User.findById({ _id: id });
    const email = user.email;
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

    // Delete Assosiated Ride with the User
    await Ride.findByIdAndDelete({
      _id: new mongoose.Types.ObjectId(user.ridePublished),
    });

    // Delete Assosiated BookedRide with the User
    await BookedRide.findByIdAndDelete({
      _id: new mongoose.Types.ObjectId(user.rideBooked),
    });

    // Delete Assosiated Inbox messages with the User
    await Inbox.findByIdAndDelete({
      _id: new mongoose.Types.ObjectId(user.inbox),
    });

    // Now Delete User
    await User.findByIdAndDelete({ _id: id });

    await mailSender(
      email,
      "Account Deleted Confirmation",
      accountDeletedMail(email)
    );
    await mailSender(
      "ecoride.in@gmail.com",
      "User Deleted Account",
      deletedAccountInfoMail(email)
    );

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "User Cannot be deleted successfully" });
  }
};
