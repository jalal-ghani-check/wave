const prisma = require("../configs/databaseConfig");
const bcrypt = require("bcrypt");
const Jwt = require("jsonwebtoken");
const { emailValidate } = require("../validations/mail");
const sendOTP = require("../services/mailSender.service");
const crypto = require("crypto");

const {
  validateAdminSignUp,
  validateForgetPassword,
  validateUpdatePassword,
  validateLogin,
} = require("../validations/admin");
require("dotenv").config();

exports.signUp = async (req, res) => {
  try {
    const { error, value } = validateAdminSignUp(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: `Validation error: ${error.details[0].message}` });
    }

    const admin = await prisma.admin.findUnique({
      where: {
        email: value.email,
      },
    });
    if (admin) {
      return res.status(400).json({ message: "Email Already Exist" });
    }
    const saltRound = process.env.saltRounds;
    const hashPassword = await bcrypt.hash(value.password, parseInt(saltRound));

    const newAdmin = await prisma.admin.create({
      data: {
        email: value.email,
        password: hashPassword,
        firstName: value.firstName,
        lastName: value.lastName,
        dateOfBirth: value.dateOfBirth,
        address: value.address,
        city: value.city,
        country: value.country,
        postalCode: value.postalCode,
        phoneNumber: value.phoneNumber,
        profile_image: value?.profile_image,
      },
    });
    delete newAdmin.password;

    return res
      .status(201)
      .json({ message: "Admin successfully created", newAdmin });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getTokenData = async (req, res) => {
  const adminId = req.admin.id;
  const admin = await prisma.admin.findUnique({
    where: {
      id: adminId,
    },
  });
  delete admin.password;
  res.json({ Admin: admin });
};

exports.logIn = async (req, res) => {
  const { error, value } = validateLogin(req.body);
  if (error) {
    return res
      .status(400)
      .json({ message: `Validation error: ${error.details[0].message}` });
  }

  const admin = await prisma.admin.findUnique({
    where: {
      email: value.email,
    },
  });

  if (admin) {
    const isPasswordMatch = await bcrypt.compare(
      value.password,
      admin.password
    );

    if (isPasswordMatch) {
      const jwtToken = Jwt.sign(
        {
          id: admin.id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          dateOfBirth: admin.dateOfBirth,
          address: admin.address,
          city: admin.city,
          country: admin.country,
          postalCode: admin.postalCode,
          phoneNumber: admin.phoneNumber,
        },
        process.env.SECRETKEY,
        {
          expiresIn: process.env.JWT_Expiry,
        }
      );

      delete admin.password;
      res
        .status(200)
        .json({ message: "login successful", admin, token: jwtToken });
    } else {
      res.status(401).json({ message: "Invalid password" });
    }
  } else {
    res.status(404).json({ message: "Admin Not found" });
  }
};

exports.getAllAdmin = async (req, res) => {
  try {
    const getAdmin = await prisma.admin.findMany();
    const hidePassword = getAdmin.map((admin) => {
      const { password, ...hidePassword } = admin;
      return hidePassword;
    });
    res
      .status(200)
      .json({ message: "Successfully Fetched admin", admin: hidePassword });
  } catch (error) {
    console.error(error);
  }
};

exports.getOne = async (req, res) => {
  try {
    const isAdmin = await prisma.admin.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!isAdmin) {
      return res.status(400).json({ message: "Admin not found" });
    }
    delete isAdmin.password;
    res.status(200).json({
      message: "Successfully Displayed data of admin",
      admin: isAdmin,
    });
  } catch (error) {
    if (error.code === "P2023") {
      return res.status(404).json({ message: "Invalid Id format" });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const { error, value } = validateForgetPassword(req.body);

    if (error) {
      return res
        .status(400)
        .json({ message: `Validation error: ${error.details[0].message}` });
    }

    const { newPassword, confirmNewPassword, otp } = value;
    const existingAdmin = await prisma.admin.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (!existingAdmin) {
      return res.status(400).json({ message: "Admin Not Exists  ." });
    }
    if (newPassword === confirmNewPassword) {
      console.log("Password are same");
      const saltRound = process.env.saltRounds;
      var hashPassword = await bcrypt.hash(newPassword, parseInt(saltRound));
    } else {
      return res.status(400).json({ message: "Passwords must be the same" });
    }
    const isOtp = await prisma.otp.findFirst({
      where: {
        receiver_id: req.params.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (!isOtp) {
      return res
        .status(404)
        .json({ message: "No OTP registered for this admin" });
    }

    if (isOtp.otp !== otp) {
      return res.status(404).json({ message: "OTP does not match" });
    }

    const expiryTimeMinutes = 1;
    const expiryTimeMilliseconds = expiryTimeMinutes * 60000;
    const createdAt = new Date(isOtp.createdAt);
    const isLimit = new Date(createdAt.getTime() + expiryTimeMilliseconds);
    const currentTime = new Date();

    if (currentTime < isLimit) {
      if (isOtp.status === "Expired") {
        return res.status(404).json({ message: "Can't use Expired OTP" });
      }
      await prisma.otp.deleteMany({
        where: {
          receiver_id: isOtp.receiver_id,
        },
      });
    } else {
      await prisma.otp.update({
        where: {
          id: isOtp.id,
        },
        data: {
          status: "Expired",
        },
      });
      return res.status(400).json({ message: "Time has expired" });
    }

    const passwordUpdate = await prisma.admin.update({
      where: {
        id: req.params.id,
      },
      data: {
        password: hashPassword,
      },
    });

    delete passwordUpdate.password;
    return res.status(201).json({
      message: "Password updated Successfully",
      data: passwordUpdate,
    });
  } catch (error) {
    if (error.code === "P2023") {
      return res.status(400).json({ message: "Invalid admin ID format" });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { error, value } = validateUpdatePassword(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: `Validation error: ${error.details[0].message}` });
    }

    const { oldpassword, newpassword, confirmPassword, otp } = value;
    const existingAdmin = await prisma.admin.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (!existingAdmin) {
      return res.status(400).json({ message: "Admin Not Exists" });
    }

    const isPassword = await bcrypt.compare(
      oldpassword,
      existingAdmin.password
    );

    if (!isPassword) {
      return res.status(400).json({ message: "Incorrect old password" });
    }
    if (oldpassword === newpassword) {
      return res
        .status(400)
        .json({ message: "New Password must not be same as old Password" });
    }

    if (confirmPassword !== newpassword) {
      return res
        .status(400)
        .json({ message: "New and Confirm passwords must be the same " });
    }

    const isOtp = await prisma.otp.findFirst({
      where: {
        receiver_id: req.params.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (!isOtp) {
      return res
        .status(404)
        .json({ message: "No OTP registered for this admin" });
    }

    if (isOtp.otp !== otp) {
      return res.status(404).json({ message: "OTP does not match" });
    }

    const expiryTimeMinutes = 1;
    const expiryTimeMilliseconds = expiryTimeMinutes * 60000;
    const createdAt = new Date(isOtp.createdAt);
    const isLimit = new Date(createdAt.getTime() + expiryTimeMilliseconds);
    const currentTime = new Date();

    if (currentTime < isLimit) {
      if (isOtp.status === "Expired") {
        return res.status(404).json({ message: "Can't use Expired OTP" });
      }
      await prisma.otp.deleteMany({
        where: {
          receiver_id: isOtp.receiver_id,
        },
      });
    } else {
      await prisma.otp.update({
        where: {
          id: isOtp.id,
        },
        data: {
          status: "Expired",
        },
      });
      return res.status(400).json({ message: "Time has expired" });
    }

    const newPass = await bcrypt.hash(
      newpassword,
      parseInt(process.env.saltRounds)
    );

    const updatedPassword = await prisma.admin.update({
      where: {
        id: req.params.id,
      },
      data: {
        password: newPass,
      },
    });
    delete updatedPassword.password;

    return res
      .status(201)
      .json({ message: "Password updated successfully.", updatedPassword });
  } catch (error) {
    if (error.code === "P2023") {
      return res.status(400).json({ message: "Invalid admin ID format" });
    }
    console.error(error);
  }
};

exports.otp = async (req, res) => {
  try {
    const { error, value } = emailValidate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: `Validation error: ${error.details[0].message}` });
    }
    const { email } = value;
    const isAdmin = await prisma.admin.findUnique({
      where: {
        email,
      },
    });

    if (!isAdmin) {
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
        receiver_id: isAdmin.id,
      },
    });
    const emailSent = await sendOTP(email, otp);
    if (emailSent) {
      console.log("OTP sent successfully");
      return res.status(200).send("OTP sent successfully");
    } else {
      return res.status(500).send("Failed to send OTP");
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Internal server error");
  }
};

exports.logout = async (req, res) => {
  try {
    const userId = req.admin.id;

    const token = Jwt.sign({ userId: userId }, process.env.SECRETKEY, {
      expiresIn: "-1s",
    });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while logging out" });
  }
};
