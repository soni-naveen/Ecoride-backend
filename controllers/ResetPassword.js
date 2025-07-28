const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { resetPasswordMail } = require("../mail/templates/resetPasswordMail");

exports.resetPasswordToken = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email });

    // Always return success to prevent email enumeration attacks
    // But only send email if user exists
    if (user) {
      const token = crypto.randomBytes(20).toString("hex");

      await User.findOneAndUpdate(
        { email: email },
        {
          token: token,
          resetPasswordExpires: Date.now() + 300000, // 5 minutes
        },
        { new: true }
      );

      await mailSender(email, "Password Reset", resetPasswordMail(token));
    }

    // Always return success message
    res.json({
      success: true,
      message:
        "If an account with that email exists, we've sent a password reset link",
    });
  } catch (error) {
    return res.json({
      error: error.message,
      success: false,
      message: `Internal Server Error`,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body;

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password should be at least 8 characters",
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
