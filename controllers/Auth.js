const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// SendOTP
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const checkUserExist = await User.findOne({ email });

    if (checkUserExist) {
      return res.status(401).json({
        success: false,
        message: "User already registered",
      });
    }
    let otp = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP generated: ", otp);

    // ============== check for unique OTP (bad method)
    const result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator(4, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });

      const otpPayload = { email, otp };

      const otpBody = await OTP.create(otpPayload);
      console.log(otpBody);

      res.status(200).json({
        success: true,
        message: "OTP sent successfully",
      });
    }
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
    const { email, password } = req.body;

    // Check if user already exist
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered",
      });
    }

    // secure password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error in hashing password",
      });
    }

    // entry in database
    const user = await User.create({
      email,
      password: hashedPassword,
    });

    return res.status(200).json({
      success: true,
      message: "User registered successfully!",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "User cannot be registered, please try again!",
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
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered, please signup first!",
      });
    }

    //verify password & generate a JWT token
    const payload = {
      email: user.email,
      id: user._id,
    };
    if (await bcrypt.compare(password, user.password)) {
      //password match
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      user = user.toObject();
      user.token = token;
      user.password = undefined; //password removed from object(not from database) to protect from hackers

      //create cookie & send response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        // A cookie with the HttpOnly attribute is inaccessible to the JavaScript Document.cookie API; it's only sent to the server
      };
      res.cookie("token", token, options).status(200).json({
        sucess: true,
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
// exports.changePassword = async (req, res) => {
//   //get data from req body
//   //validation
//   //get newPassword, confirmNewPassword
//   //update pwd in DB
//   //send mail - Password updated
//   //return response
// };

//   In MongoDB, createdAt: -1 typically refers to a query option used with the sort method to sort documents in descending order by their createdAt field. This means that the documents will be arranged from newest to oldest based on their createdAt timestamps.

// In MongoDB, limit(1) is a method used to limit the number of documents returned by a query to just one document.

// In MongoDB, populate is a function that replaces a specified path in a document from one collection with the document from another collection.

// The populate() method is called on the query, which is used to automatically load the data of the sender and chat field into the messages results. The first argument to populate is the name of the the field that we want to load, and the second argument is the fields of the related collection that we want to select.

// populate("sender", "name pic email") will load the data of sender field with the name, pic, and email fields of the related User collection.

// populate("chat") will load the data of the chat field with all the fields of the related chat collection.

// httpOnly : a boolean indicating whether the cookie is only to be sent over HTTP(S), and not made available to client JavaScript
