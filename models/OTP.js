const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const {
  emailTemplate,
} = require("../mail/templates/emailVerificationTemplate");
const OTPSchema = new mongoose.Schema(
  {
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
      default: Date.now,
      expires: 5 * 60, // Document will be deleted 5 minutes after creation
    },
  },
  { versionKey: false }
);

async function sendVerificationEmail(email, otp) {
  // Create a transporter to send emails
  // Define the email options
  // Send the email
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email",
      emailTemplate(otp)
    );
    if (mailResponse) {
      console.log("Email sent successfully");
    } else {
      console.log("Error: Mail response is undefined");
    }
  } catch (error) {
    console.log("Error occurred while sending email: ", error);
    throw error;
  }
}

// Define a post-save hook to send email after the document has been saved
OTPSchema.pre("save", async function (next) {
  // console.log("New document saved to database");

  // Only send an email when a new document is created
  if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp);
  }
  next();
});

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;
