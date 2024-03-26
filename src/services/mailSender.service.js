const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
dotenv.config();

const sendOTP = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailData = {
      from: process.env.EMAIL,
      to: email,
      subject: `OTP for Verification`,
      html: `Your OTP is: <strong>${otp}</strong>`,
    };
    await transporter.sendMail(mailData);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

module.exports = sendOTP;
