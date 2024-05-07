const { contactUsEmail } = require("../mail/templates/contactFormRes");
const { formData } = require("../mail/templates/formData");
const mailSender = require("../utils/mailSender");

exports.contactUsController = async (req, res) => {
  const { email, firstname, lastname, message } = req.body;
  // console.log(req.body);
  try {
    const emailRes = await mailSender(
      email,
      "Your form data send successfully",
      contactUsEmail(email, firstname, lastname, message)
    );
    const formdata = await mailSender(
      "ecoride.in@gmail.com",
      "New Form Data Received",
      formData(email, firstname, lastname, message)
    );
    console.log("Email Res ", emailRes);
    return res.json({
      success: true,
      message: "Email send successfully",
    });
  } catch (error) {
    console.log("Error", error);
    console.log("Error message :", error.message);
    return res.json({
      success: false,
      message: "Something went wrong...",
    });
  }
};
