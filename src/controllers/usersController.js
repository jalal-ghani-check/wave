const prisma = require("../configs/databaseConfig");
const bcrypt = require("bcrypt");
const Jwt = require("jsonwebtoken");

const {
  validateUserSignUp,
  validateUserUpdate,
  validateForgetPassword,
  validateUpdatePassword,
  validateLogin,
} = require("../validations/users");
const { start } = require("repl");
require("dotenv").config();

exports.signUp = async (req, res) => {
  try {
    const { error, value } = validateUserSignUp(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: `Validation error: ${error.details[0].message}` });
    }
    const user = await prisma.user.findUnique({
      where: {
        email: value.email,
      },
    });
    if (user) {
      return res.status(400).json({ message: "Email Already Exist" });
    }
    const saltRound = process.env.saltRounds;
    const hashPassword = await bcrypt.hash(value.password, parseInt(saltRound));
    const newUser = await prisma.user.create({
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
        profile_image: value?.profile_image || null,
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
  const { error, value } = validateLogin(req.body);
  if (error) {
    return res
      .status(400)
      .json({ message: `Validation error: ${error.details[0].message}` });
  }
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
    if (error.code === "P2023") {
      return res.status(404).json({ message: "Invalid Id format" });
    }
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
    const post = await prisma.post.findMany({
      where: {
        userId: userId,
      },
    });
    await prisma.post.deleteMany({
      where: {
        userId: userId,
      },
    });
    const chat = await prisma.chat.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
    });
    await prisma.chat.deleteMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
    });

    const chatMessages = await prisma.chatMessages.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
    });
    await prisma.chatMessages.deleteMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
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
    const { error, value } = validateUserUpdate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: `Validation error: ${error.details[0].message}` });
    }
    const existingUser = await prisma.user.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }
    if (value.email !== undefined && value.email !== existingUser.email) {
      const userWithEmail = await prisma.user.findUnique({
        where: {
          email: value.email,
        },
      });

      if (userWithEmail) {
        return res.status(400).json({ message: "Email Already Registered" });
      }
    } else {
      email = existingUser.email;
    }
    const updateData = await prisma.user.update({
      where: {
        id: req.params.id,
      },
      data: {
        firstName: value?.firstName,
        lastName: value?.lastName,
        email: value?.email,
        dateOfBirth: value?.dateOfBirth,
        address: value?.address,
        city: value?.city,
        country: value?.country,
        postalCode: value?.postalCode,
        phoneNumber: value?.phoneNumber,
        profile_image: value?.profile_image,
      },
    });
    delete updateData.password;
    return res.status(201).json({
      message: "User updated Successfully",
      data: updateData,
    });
  } catch (error) {
    if (error.code === "P2023") {
      return res.status(400).json({ message: "Invalid user ID format" });
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
    const existingUser = await prisma.user.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (!existingUser) {
      return res.status(400).json({ message: "User Not Exists  " });
    }
    if (newPassword === confirmNewPassword) {
      console.log("Password are same");
      const saltRound = process.env.saltRounds;
      var hashPassword = await bcrypt.hash(newPassword, parseInt(saltRound));
      console.log(hashPassword);
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
        .json({ message: "No OTP registered for this user" });
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
    const passwordUpdate = await prisma.user.update({
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
      return res.status(400).json({ message: "Invalid user ID format" });
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
    const existingUser = await prisma.user.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (!existingUser) {
      return res.status(400).json({ message: "User Not Exists  " });
    }
    const isPassword = await bcrypt.compare(oldpassword, existingUser.password);
    if (!isPassword) {
      return res.status(400).json({ message: "Incorrect old password" });
    }
    console.log(oldpassword);
    console.log(newpassword);

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
        .json({ message: "No OTP registered for this user" });
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

exports.filterView = async (req, res) => {
  const { categoryName, searchPost, userLat, userLon, distance } = req.body;
  try {
    let searchResult;
    if (categoryName && searchPost) {
      searchResult = await prisma.post.findMany({
        where: {
          categoryName: categoryName,
          OR: [
            { title: { contains: searchPost, mode: "insensitive" } },
            { body: { contains: searchPost, mode: "insensitive" } },
          ],
        },
      });
    } else if (categoryName) {
      searchResult = await prisma.post.findMany({
        where: {
          categoryName: categoryName,
        },
      });
    } else if (searchPost) {
      searchResult = await prisma.post.findMany({
        where: {
          OR: [
            { title: { contains: searchPost, mode: "insensitive" } },
            { body: { contains: searchPost, mode: "insensitive" } },
          ],
        },
      });
    } else {
      searchResult = await prisma.post.findMany();
    }
    function haversineDistance(lat1, lon1, lat2, lon2) {
      const R = 6371e3; // Earth's radius in meters
      const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c; // in meters
      return d;
    }
    let nearbyPosts = searchResult;
    if (userLat && userLon && distance) {
      nearbyPosts = searchResult.filter((post) => {
        const postDistance = haversineDistance(
          userLat,
          userLon,
          post.latitude,
          post.longitude
        );
        return postDistance <= distance;
      });
    }
    res.json({ result: nearbyPosts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.lastAdded = async (req, res) => {
  const days = parseInt(req.params.days);
  if (isNaN(days) || days <= 0) {
    return res.status(400).json({ error: "Invalid number of days provided" });
  }
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  console.log(startDate);
  try {
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const hidePassword = users.map((user) => {
      const { password, ...elseUserProperties } = user;
      return elseUserProperties;
    });

    let user = 0;
    users.forEach(() => {
      user++;
    });
    const response = {
      user: user,
      poshidePasswordts: hidePassword,
    };

    return res.status(200).json(response);

    return res.status(200).json(hidePassword);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
};
