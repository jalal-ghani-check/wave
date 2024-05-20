const prisma = require("../configs/databaseConfig");
const bcrypt = require("bcrypt");
const Jwt = require("jsonwebtoken");
const { emailValidate } = require("../validations/mail");
const sendOTP = require("../services/mailSender.service");
const crypto = require("crypto");
const cloudinary = require("../configs/image-uploadConfig")
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
    const isUser = await prisma.user.findUnique({
      where: {
        email: value.email,
      },
    });
    if (isUser) {
      return res.status(400).json({ message: "Email Already Exist" });
    }
    const saltRound = process.env.saltRounds;
    const hashPassword = await bcrypt.hash(value.password, parseInt(saltRound));
    const user = await prisma.user.create({
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
   const jwtToken = Jwt.sign( user  , process.env.SECRETKEY,
    {
      expiresIn: process.env.JWT_Expiry,
    });
    delete user.password;

    return res
      .status(201)
      .json({ message: "user successfully created", user, token: jwtToken });
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
    res.status(404).json({ message: "The requested user could not be found." });
  }
};

exports.getAllUser = async (req, res) => {
  try {
    const getUser = await prisma.user.findMany();
    const userCount = await prisma.user.count()   
   const hidePassword = getUser.map((user) => {
      const { password, ...hidePassword } = user;
      return hidePassword;
    });
    res
      .status(200)
      .json({ message: "Successfully Fetched users", user: hidePassword , total:userCount });
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

// exports.deleteUser = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const existingId = await prisma.user.findUnique({
//       where: {
//         id: userId,
//       },
//     });
//     if (!existingId) {
//       return res.status(400).json({ message: "user not found" });
//     }

//     await prisma.chatMessages.deleteMany({
//       where: {
//         OR: [{ senderId: userId }, { receiverId: userId }],
//       },
//     });
//     await prisma.chat.deleteMany({
//       where: {
//         OR: [{ senderId: userId }, { receiverId: userId }],
//       },
//     });
//     const posts = await prisma.post.findMany({
//       where: {
//         userId: userId,
//       },
//     });

//     for (const post of posts) {
//       await prisma.chat.deleteMany({
//         where: {
//           postId: post.id,
//         },
//       });
//     }

//     await prisma.post.deleteMany({
//       where: {
//         userId: userId,
//       },
//     });

//     await prisma.user.delete({
//       where: {
//         id: userId,
//       },
//     });
//     return res.status(200).json({ message: "user deleted Successfully" });
//   } catch (error) {
//     if (error.code === "P2023") {
//       return res.status(404).json({ message: "Invalid Id format" });
//     }
//     console.error(error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.updateUser = async (req, res) => {
  try {
    const { error, value } = validateUserUpdate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: `Validation error: ${error.details[0].message}` });
    }
    const userId = req.user.id;
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }
    if (existingUser.id !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this user" });
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
        id: userId,
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
    const { newPassword, otp, email } = value;
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!existingUser) {
      return res.status(400).json({ message: "User email Not Exists  " });
    }
  
      const saltRound = process.env.saltRounds;
      var hashPassword = await bcrypt.hash(newPassword, parseInt(saltRound));

      
    const isOtp = await prisma.otp.findFirst({
      where: {
        receiver_email: email,
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
    const expiryTimeMinutes = 5;
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
          receiver_email: isOtp.receiver_email,
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
        email: email,
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
    const { oldpassword, newpassword } = value;
    const userId = req.user.id;
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!existingUser) {
      return res.status(400).json({ message: "User Not Exists  " });
    }
    const isPassword = await bcrypt.compare(oldpassword, existingUser.password);
    if (!isPassword) {
      return res.status(400).json({ message: "Incorrect old password" });
    }
    if (oldpassword === newpassword) {
      return res
        .status(400)
        .json({ message: "New Password must not be same as old Password" });
    }

    const newPass = await bcrypt.hash(
      newpassword,
      parseInt(process.env.saltRounds)
    );
    const updatedPassword = await prisma.user.update({
      where: {
        id: userId,
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
  const { categoryName, searchPost, userLat, userLon, distance  } = req.body;
  try {
    const userId = req.user.id 
    let searchResult;
    if (categoryName.some((search)=> search !== "") && searchPost) {
      searchResult = await prisma.post.findMany({ 
        where: {
          categoryName:   { in: categoryName}, 
          OR: [
            { title: { contains: searchPost, mode: "insensitive" } },
            { body: { contains: searchPost, mode: "insensitive" } },
          ],
        },
      });
    } else if (categoryName &&  categoryName.some(search => search !== "")) {
       searchResult = await prisma.post.findMany({
        where: {
          categoryName:{in: categoryName.filter(search => search !== "")},
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

   nearbyPosts =  nearbyPosts.filter((post)=> post.userId !==userId )

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

exports.otp = async (req, res) => {
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

    if (!isUser) {
      return res.status(404).send("Email Not Found !! ");
    }
    const min = 1000;
    const max = 9999;
    const otp = crypto.randomInt(min, max + 1);
    const data = await prisma.otp.create({
      data: {
        otp: otp,
        receiver_email: isUser.email,
      },
    });
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
};

exports.logout = async (req, res) => {
  try {
    const userId = req.user.id;

    const token = Jwt.sign({ userId: userId }, process.env.SECRETKEY, {
      expiresIn: "-1s",
    });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while logging out" });
  }
};

// controller
exports.uploadProfile = async (req, res) => {
  try {
      const userId = req.user.id;
    const currentTimeInMilliseconds = new Date().getTime();
    let user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return LoggerService.LoggerHandler(
        STRINGS.STATUS_CODE.NOT_FOUND,
        STRINGS.ERRORS.userNotExists,
        res
      );
    }
    // Convert milliseconds to seconds
    const currentTimeInSeconds = Math.floor(currentTimeInMilliseconds / 1000);
     const result = await cloudinary.uploader.upload(req.file.path, {
      public_id: `${currentTimeInSeconds}_event_image`,
    });
    let image_url = result.url
    console.log("event image_url ---> ", image_url)
    return res.status(200).json({ message: "uploaded image" , image_url: image_url});

  } catch (error) {
    console.log("error ----> ", error)
    return res.status(500).json({ message: "Error uploading image" });

  }
}
 