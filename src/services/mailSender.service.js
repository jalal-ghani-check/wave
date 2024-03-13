/// Make OTP  First
const prisma = require("../configs/databaseConfig");
const express = require("express");
const app = express();
const dotenv = require("dotenv");
//const prisma = require("../configs/databaseConfig");
const cors = require("cors");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { emailValidate } = require("../validations/mail");

// Load environment variables
dotenv.config();

// Middleware
app.use(express.json());
app.use(cors());

// Function to send OTP via email
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

    // Send mail
    await transporter.sendMail(mailData);
    return true; // Email sent successfully
  } catch (error) {
    console.error("Error sending email:", error);
    return false; // Email sending failed
  }
};

// Endpoint to send OTP via email
app.post("/sendotp", async (req, res) => {
  try {
    const { error, value } = emailValidate(req.body);

    if (error) {
      return res
        .status(400)
        .json({ message: `Validation error: ${error.details[0].message}` });
    }

    const { email } = value;

    const isUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    const isAdmin = await prisma.admin.findUnique({
      where: {
        email,
      },
    });

    if (!isUser && !isAdmin) {
      return res.status(404).send("Email Not Found !! ");
    }

    const min = 1000;
    const max = 9999;
    const otp = crypto.randomInt(min, max + 1);

    console.log("OTP:", otp);

    const data = await prisma.otp.create({
      data: {
        email: email,
        otp: otp,
        receiver_id: isUser ? isUser.id : isAdmin.id,
      },
    });

    console.log(data);
    // Send OTP via email
    const emailSent = await sendOTP(email, otp);

    if (emailSent) {
      return res.status(200).send("OTP sent successfully");
    } else {
      return res.status(500).send("Failed to send OTP");
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Internal server error");
  }
});

const PORT = 8000;
app.listen(PORT, () => console.log(`Server up and running at port ${PORT}`));
