const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

exports.resetPasswordToken = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.json({
        success: false,
        message: "Your Email is not registered with us",
      });
    }
    //generate token
    const token = crypto.randomUUID();

    //update user by adding token and expiration time
    const updateDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpired: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );

    //create url
    const url = `https://localhost:3000/update-password/${token}`;

    //send mail containing the url
    await mailSender(
      email,
      "Password reset link",
      `Password reset link: ${url}`
    );
    return res.json({
      success: true,
      message: "Email sent successfully, please check email and change pwd",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending reset password mail",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    //data fetch
    const { password, confirmPassword, token } = req.body;
    //validation
    if (password != confirmPassword) {
      return res.json({
        success: false,
        message: "Password not matching",
      });
    }
    const userDetails = await User.findOne({ token: token });
    if (!userDetails) {
      return res.json({
        success: false,
        message: "Token is invalid",
      });
    }

    if (userDetails.resetPasswordExpired < Date.now()) {
      return res.json({
        sucess: false,
        message: "Token is expired, please regenerate you token",
      });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //password update
    await User.findOneAndUpdate(
      { token: token },
      {
        password: hashedPassword,
      },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending reset password mail",
    });
  }
};
