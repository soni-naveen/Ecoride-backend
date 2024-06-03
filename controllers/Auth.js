const User = require("../models/User");
const Ride = require("../models/Ride");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

// SendOTP
exports.sendotp = async (req, res) => {
  try {
    // fetch email from request body
    const { email } = req.body;

    //check if user already exist
    const checkUserExist = await User.findOne({ email });

    //if user already exist, then return a response
    if (checkUserExist) {
      return res.status(401).json({
        success: false,
        message: "User already registered",
      });
    }

    //generate OTP
    let otp = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    //check for unique OTP or not (bad method)
    const result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator(4, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }
    const otpPayload = { email, otp };

    //create an entry for OTP
    const otpBody = await OTP.create(otpPayload);
    // console.log(otpBody);

    //return response successful
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Signup
exports.signup = async (req, res) => {
  try {
    //data fetch from request body
    const { email, password, confirmPassword, otp } = req.body;

    //validation
    if (!email || !password || !confirmPassword || !otp) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    //confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and ConfirmPassword value does not match, please try again!",
      });
    }

    // Check if user already exist
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User is already registered",
      });
    }

    //find most recent OTP stored for the user
    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);

    //validate OTP
    if (response.length == 0) {
      //OTP not found
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    } else if (otp != response[0].otp) {
      //Invalid OTP
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    } else {
      //Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // entry create in database
      const profileDetails = await Profile.create({
        profileId: crypto.randomBytes(20).toString("hex"),
        email: email,
        firstName: null,
        lastName: null,
        gender: null,
        dateOfBirth: null,
        contactNumber: null,
        govtId: null,
        about: "",
        vehicle: "",
        dateJoined: Date.now(),
        noOfRidesPublished: 0,
        overallRating: 0.0,
        drivingRating: 0.0,
      });

      const rideDetails = await Ride.create({
        email: email,
        fromWhere: "",
        toWhere: "",
        date: "",
        leavingTime: "",
        noOfSeats: 0,
        reachingTime: "",
        price: 0,
        stopPoint1: "",
        stopPoint2: "",
        stopPoint3: "",
      });

      const user = await User.create({
        email,
        password: hashedPassword,
        additionalDetails: profileDetails._id,
        image: `https://api.dicebear.com/5.x/initials/svg?seed=${email}&chars=1`,
        ridePublished: rideDetails._id,
      });

      const payload = {
        email: user.email,
        id: user._id,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      // user = user.toObject();
      user.token = token;
      user.password = undefined; //password removed from object(not from database) to protect from hackers

      //create cookie & send response
      const options = {
        expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        // A cookie with the HttpOnly attribute is inaccessible to the JavaScript Document.cookie API; it's only sent to the server
      };

      return res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "User registered successfully!",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered, Please try again!",
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    //data fetch
    const { email, password } = req.body;
    //validation on email and password
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "Please fill all the details carefully!",
      });
    }

    //check for registered user
    const user = await User.findOne({ email }).populate("additionalDetails").populate("ridePublished");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered, please signup first!",
      });
    }

    //verify password & generate a JWT token
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      // user = user.toObject();
      user.token = token;
      user.password = undefined; //password removed from object(not from database) to protect from hackers

      //create cookie & send response
      const options = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true,
        // A cookie with the HttpOnly attribute is inaccessible to the JavaScript Document.cookie API; it's only sent to the server
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged in successfully",
      });
    } else {
      //password do not match
      return res.status(401).json({
        success: false,
        message: "Password Incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Login Failure, please try again!",
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    // Get user data from req.user
    const userDetails = await User.findById(req.user.id);
    const profile = await Profile.findById(userDetails.additionalDetails);

    // Get old password, new password, and confirm new password from req.body
    const { oldPassword, newPassword } = req.body;

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );
    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" });
    }

    // Update password
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    );

    // Send notification email
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        "Password for your account has been updated",
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${profile.firstName} ${profile.lastName}`
        )
      );
      console.log("Email sent successfully:", emailResponse.response);
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      });
    }

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    console.error("Error occurred while updating password:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    });
  }
};

//   In MongoDB, createdAt: -1 typically refers to a query option used with the sort method to sort documents in descending order by their createdAt field. This means that the documents will be arranged from newest to oldest based on their createdAt timestamps.

// In MongoDB, limit(1) is a method used to limit the number of documents returned by a query to just one document.

// In MongoDB, populate is a function that replaces a specified path in a document from one collection with the document from another collection.

// The populate() method is called on the query, which is used to automatically load the data of the sender and chat field into the messages results. The first argument to populate is the name of the the field that we want to load, and the second argument is the fields of the related collection that we want to select.

// populate("sender", "name pic email") will load the data of sender field with the name, pic, and email fields of the related User collection.

// populate("chat") will load the data of the chat field with all the fields of the related chat collection.

// httpOnly : a boolean indicating whether the cookie is only to be sent over HTTP(S), and not made available to client JavaScript
