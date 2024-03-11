const prisma = require("../configs/databaseConfig");
const bcrypt = require("bcrypt");
const Jwt = require("jsonwebtoken");
const {
  ValidationEmail,
  forgetPasswordValidation,
  updatePasswordValidation,
  UpdateValidation,
  ValidationEmailPassword,
} = require("../middlewares/validation.admin.middleware");
require("dotenv").config();

exports.signUp = async (req, res) => {
  try {
    const validationEmailPassword = await ValidationEmailPassword(req, res);

    if (validationEmailPassword.status !== 200) {
      return res
        .status(validationEmailPassword.status)
        .json(validationEmailPassword.data);
    }

    const {
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      address,
      city,
      country,
      postalCode,
      phoneNumber,
    } = validationEmailPassword.data;

    const admin = await prisma.admin.findUnique({
      where: {
        email: req.body.email,
      },
    });
    if (admin) {
      return res.status(400).json({ message: "Email Already Exist", email });
    }
    const saltRound = process.env.saltRounds;
    const hashPassword = await bcrypt.hash(password, parseInt(saltRound));

    const newAdmin = await prisma.admin.create({
      data: {
        email,
        password: hashPassword,
        firstName,
        lastName,
        dateOfBirth,
        address,
        city,
        country,
        postalCode,
        phoneNumber,
      },
    });
    delete newAdmin.password;
    return res
      .status(201)
      .json({ message: "admin successfully created", newAdmin });
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
  const admin = await prisma.admin.findUnique({
    where: {
      email: req.body.email,
    },
  });

  if (admin) {
    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
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
    res.status(404).json({ message: "admin Not found" });
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
    console.log("Hi 2");
    const isId = await prisma.admin.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!isId) {
      return res.status(400).json({ message: "admin not found" });
    }
    delete isId.password;
    res
      .status(200)
      .json({ message: "Successfully Displayed data of admin", admin: isId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    console.log("ok");
    const adminId = req.params.id;

    const existingId = await prisma.admin.findUnique({
      where: {
        id: adminId,
      },
    });

    if (!existingId) {
      return res.status(400).json({ message: "admin not found" });
    }

    await prisma.admin.delete({
      where: {
        id: adminId,
      },
    });

    return res.status(200).json({ message: "admin deleted Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    let UpdateVal = await UpdateValidation(req, res);

    // const password = req.body.password;

    if (UpdateVal.status != 200) {
      return res.status(UpdateVal.status).json(UpdateVal.data);
    }

    const {
      email,
      firstName,
      lastName,
      dateOfBirth,
      address,
      city,
      country,
      postalCode,
      phoneNumber,
    } = UpdateVal.data;

    const updateData = await prisma.admin.update({
      where: {
        id: req.params.id,
      },
      data: {
        firstName: firstName,
        lastName: lastName,
        email: email,
        dateOfBirth: dateOfBirth,
        address: address,
        city: city,
        country: country,
        postalCode: postalCode,
        phoneNumber: phoneNumber,
      },
    });
    delete updateData.password;
    return res.status(201).json({
      message: "admin updated Successfully",
      data: updateData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const adminId = req.params.id;
    let updataPass = await forgetPasswordValidation(req, res);

    // const password = req.body.password;

    if (updataPass.status != 200) {
      return res.status(updataPass.status).json(updataPass.data);
    }

    const { newPassword, confirmNewPassword } = updataPass.data;

    if (newPassword === confirmNewPassword) {
      console.log("Password are same");
      const saltRound = process.env.saltRounds;
      var hashPassword = await bcrypt.hash(newPassword, parseInt(saltRound));

      console.log(hashPassword);
    } else {
      return res.status(400).json({ message: "Passwords must be the same" });
    }

    const admin = await prisma.admin.findUnique({
      where: {
        id: adminId,
      },
    });

    const passwordUpdate = await prisma.admin.update({
      where: {
        id: adminId,
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
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    console.log("ABC");
    let UpdatePass = await updatePasswordValidation(req, res);

    // const password = req.body.password;

    if (UpdatePass.status != 200) {
      return res.status(UpdatePass.status).json(UpdatePass.data);
    }

    const { oldpassword, newpassword, confirmPassword } = UpdatePass.data;

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
