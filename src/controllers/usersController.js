const prisma = require("../configs/databaseConfig");
const bcrypt = require("bcrypt");
const Jwt = require("jsonwebtoken");
const {
  ValidationEmail,
  forgetPasswordValidation,
  updatePasswordValidation,
  UpdateValidation,
  ValidationEmailPassword,
} = require("../middlewares/validation.user.middleware");
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

    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });
    if (user) {
      return res.status(400).json({ message: "Email Already Exist", email });
    }
    const saltRound = process.env.saltRounds;
    const hashPassword = await bcrypt.hash(password, parseInt(saltRound));

    const newUser = await prisma.user.create({
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
    delete newUser.password;

    return res
      .status(201)
      .json({ message: "user successfully created", newUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getTokenData = async (req, res) => {
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  delete user.password;
  res.json({ User: user });
};

exports.logIn = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
  });

  if (user) {
    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (isPasswordMatch) {
      const jwtToken = Jwt.sign(
        {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          dateOfBirth: user.dateOfBirth,
          address: user.address,
          city: user.city,
          country: user.country,
          postalCode: user.postalCode,
          phoneNumber: user.phoneNumber,
        },
        process.env.SECRETKEY,
        {
          expiresIn: process.env.JWT_Expiry,
        }
      );

      delete user.password;
      res
        .status(200)
        .json({ message: "login successful", user, token: jwtToken });
    } else {
      res.status(401).json({ message: "Invalid password" });
    }
  } else {
    res.status(404).json({ message: "user Not found" });
  }
};

exports.getAllUser = async (req, res) => {
  try {
    const getUser = await prisma.user.findMany();

    const hidePassword = getUser.map((user) => {
      const { password, ...hidePassword } = user;
      return hidePassword;
    });

    res
      .status(200)
      .json({ message: "Successfully Fetched users", user: hidePassword });
  } catch (error) {
    console.error(error);
  }
};

exports.getOne = async (req, res) => {
  try {
    const isId = await prisma.user.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!isId) {
      return res.status(400).json({ message: "user not found" });
    }
    delete isId.password;
    res
      .status(200)
      .json({ message: "Successfully Displayed data of user", user: isId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const existingId = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingId) {
      return res.status(400).json({ message: "user not found" });
    }

    const messages = await prisma.message.findMany({
      where: {
        id: userId,
      },
    });

    await prisma.message.deleteMany({
      where: {
        id: userId,
      },
    });

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return res.status(200).json({ message: "user deleted Successfully" });
  } catch (error) {
    if (error.code === "P2023") {
      return res.status(404).json({ message: "Invalid Id format" });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateUser = async (req, res) => {
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

    const updateData = await prisma.user.update({
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
      message: "user updated Successfully",
      data: updateData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const userId = req.params.id;
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

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    const passwordUpdate = await prisma.user.update({
      where: {
        id: userId,
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
    let UpdatePass = await updatePasswordValidation(req, res);

    if (UpdatePass.status != 200) {
      return res.status(UpdatePass.status).json(UpdatePass.data);
    }

    const { oldpassword, newpassword, confirmPassword } = UpdatePass.data;

    const newPass = await bcrypt.hash(
      newpassword,
      parseInt(process.env.saltRounds)
    );

    const updatedPassword = await prisma.user.update({
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
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    console.error(error);
  }
};
