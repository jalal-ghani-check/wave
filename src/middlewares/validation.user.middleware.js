const Joi = require("joi");
const bcrypt = require("bcrypt");
const prisma = require("../configs/databaseConfig");

const emailSchema = Joi.object({
  email: Joi.string().email().required(),
});

const forgetpasswordSchema = Joi.object({
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-z]).*$/)
    .required(),
  confirmNewPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-z]).*$/)
    .required(),
  otp: Joi.string().length(4).required(),
});

const updatePasswordSchema = Joi.object({
  oldpassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-z]).*$/)
    .required(),
  newpassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-z]).*$/)
    .required(),
  confirmPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-z]).*$/)
    .required(),
  otp: Joi.string().length(4).required(),
});

const signUpSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-z]).*$/)
    .message("please enter correct password")

    .required(),

  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  dateOfBirth: Joi.date().required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  country: Joi.string().required(),
  postalCode: Joi.string().required(),
  phoneNumber: Joi.string().required(),
});

const UpdateSchema = Joi.object({
  email: Joi.string().email().allow("").optional(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-z]).*$/)
    .optional(),

  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  dateOfBirth: Joi.date().optional(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  country: Joi.string().optional(),
  postalCode: Joi.string().optional(),
  phoneNumber: Joi.string().optional(),
});

async function ValidationEmail(req, res) {
  try {
    const { email } = req.body;
    const validate = emailSchema.validate({ email });
    if (validate.error) {
      return res
        .status(400)
        .json({ message: validate.error.details[0].message });
    }
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User Already Exists with this Email" });
    }

    return { status: 200, data: { email } };
  } catch (error) {
    if (error.code === "P2023") {
      return res.status(400).json({ message: "Invalid admin ID format" });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function ValidationEmailPassword(req, res) {
  try {
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
    } = req.body;

    const validate = signUpSchema.validate({
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
    });

    if (validate.error) {
      return res
        .status(400)
        .json({ message: validate.error.details[0].message });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      return res.status(400).json({ message: "User Already Exists  " });
    }

    return {
      status: 200,
      data: {
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
      },
    };
  } catch (error) {
    if (error.code === "P2023") {
      return res.status(400).json({ message: "Invalid admin ID format" });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function UpdateValidation(req, res) {
  try {
    let email = req.body.email;
    const {
      firstName,
      lastName,
      dateOfBirth,
      address,
      city,
      country,
      postalCode,
      phoneNumber,
    } = req.body;

    const validate = UpdateSchema.validate({
      email,
      firstName,
      lastName,
      dateOfBirth,
      address,
      city,
      country,
      postalCode,
      phoneNumber,
    });

    if (validate.error) {
      return res
        .status(400)
        .json({ message: validate.error.details[0].message });
    }

    const userId = req.params.id;

    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }

    if (email !== undefined && email !== existingUser.email) {
      const userWithEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (userWithEmail) {
        return res.status(400).json({ message: "Email Already Registered" });
      }
    } else {
      email = existingUser.email;
    }

    return {
      status: 200,
      data: {
        email,
        firstName,
        lastName,
        dateOfBirth,
        address,
        city,
        country,
        postalCode,
        phoneNumber,
      },
    };
  } catch (error) {
    if (error.code === "P2023") {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function forgetPasswordValidation(req, res) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (!existingUser) {
      return res.status(400).json({ message: "User Not Exists  " });
    }

    const { newPassword, confirmNewPassword, otp } = req.body;

    const validate = forgetpasswordSchema.validate({
      newPassword,
      confirmNewPassword,
      otp,
    });

    if (validate.error) {
      return res
        .status(400)
        .json({ message: validate.error.details[0].message });
    }

    const isUser = await prisma.otp.findFirst({
      where: {
        userId: req.params.id,
      },
      orderBy: {
        updatedAt: "desc", // Ordering by updatedAt in descending order
      },
    });

    // Check if OTP record exists for the user
    if (!isUser) {
      return res
        .status(404)
        .json({ message: "No OTP registered for this user" });
    }

    // Check if OTP matches the provided OTP
    if (isUser.otp !== otp) {
      return res.status(404).json({ message: "OTP does not match" });
    }

    return {
      status: 200,
      data: {
        newPassword,
        confirmNewPassword,
      },
    };
  } catch (error) {
    if (error.code === "P2023") {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function updatePasswordValidation(req, res) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (!existingUser) {
      return res.status(400).json({ message: "User Not Exists  " });
    }

    const { oldpassword, newpassword, confirmPassword, otp } = req.body;
    const validate = updatePasswordSchema.validate({
      oldpassword,
      newpassword,
      confirmPassword,
      otp,
    });
    if (validate.error) {
      return res
        .status(400)
        .json({ message: validate.error.details[0].message });
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

    const isUser = await prisma.otp.findFirst({
      where: {
        userId: req.params.id,
      },
      orderBy: {
        updatedAt: "desc", // Ordering by updatedAt in descending order
      },
    });

    // Check if OTP record exists for the user
    if (!isUser) {
      return res
        .status(404)
        .json({ message: "No OTP registered for this user" });
    }

    // Check if OTP matches the provided OTP
    if (isUser.otp !== otp) {
      return res.status(404).json({ message: "OTP does not match" });
    }

    return {
      status: 200,
      data: {
        oldpassword,
        newpassword,
        confirmPassword,
      },
    };
  } catch (error) {
    if (error.code === "P2023") {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  ValidationEmail,
  forgetPasswordValidation,
  ValidationEmailPassword,
  UpdateValidation,
  updatePasswordValidation,
};
