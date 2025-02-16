const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { resetPasswordMail } = require("../mail/templates/resetPasswordMail");

exports.resetPasswordToken = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.json({
        error: `This email is not registered with us.`,
        success: false,
        message: `Email is not registered`,
      });
    }
    const token = crypto.randomBytes(20).toString("hex");

    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 300000, // 5 minutes
      },
      { new: true }
    );
    // console.log("DETAILS", updatedDetails);

    await mailSender(email, "Password Reset", resetPasswordMail(token));

    res.json({
      success: true,
      message:
        "Email Sent Successfully, Please Check Your Email to Continue Further",
    });
  } catch (error) {
    return res.json({
      error: error.message,
      success: false,
      message: `Some Error in Sending the Reset Email`,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body;

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password length must be 8",
      });
    }
    if (confirmPassword !== password) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm password does not match",
      });
    }
    const userDetails = await User.findOne({ token: token });
    if (!userDetails) {
      return res.status(401).json({
        success: false,
        message: "Token is Invalid",
      });
    }
    if (!(userDetails.resetPasswordExpires > Date.now())) {
      return res.status(403).json({
        success: false,
        message: `Token is Expired, Please regenerate your token`,
      });
    }
    const encryptedPassword = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate(
      { token: token },
      { password: encryptedPassword },
      { new: true }
    );
    res.json({
      success: true,
      message: `Password Reset Successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      success: false,
      message: `Some Error in Updating the Password`,
    });
  }
};
