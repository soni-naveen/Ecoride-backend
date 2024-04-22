const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 2 * 60,
  },
});

// Important to write before export
// because user is stored to mongodb if the OTP is correct otherwise not stored

//function --> to send emails
async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(email, "Verification : EcoRide", otp);
    console.log("Email sent successfully: ", mailResponse);
  } catch (error) {
    console.log("Error occurred while sending mail: ", error);
  }
}

OTPSchema.pre("save", async function (next) {
  await sendVerificationEmail(this.email, this.otp);
  next();
});

// Pre middleware functions are executed one after another, when each middleware calls next.
// https://mongoosejs.com/docs/middleware.html

module.exports = mongoose.model("OTP", OTPSchema);
