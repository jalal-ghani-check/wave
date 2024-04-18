const Joi = require("joi");

function validateUserSignUp(user) {
  const usersignUpSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*]).*$/)
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
    profile_image: Joi.string().optional(),
  });
  const { error, value } = usersignUpSchema.validate(user);
  return { error, value };
}

function validateUserUpdate(user) {
  const userUpdateSchema = Joi.object({
    email: Joi.string().email().allow("").optional(),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*]).*$/)
      .optional(),

    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    dateOfBirth: Joi.date().optional(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    country: Joi.string().optional(),
    postalCode: Joi.string().optional(),
    phoneNumber: Joi.string().optional(),
    profile_image: Joi.string().optional(),
  });

  const { error, value } = userUpdateSchema.validate(user);
  return { error, value };
}

function validateForgetPassword(user) {
  const forgetpasswordSchema = Joi.object({
    email: Joi.string().email().required(),
    newPassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*]).*$/)
      .required(),
    otp: Joi.number().integer().min(1000).max(9999).required(),
  });

  const { error, value } = forgetpasswordSchema.validate(user);
  return { error, value };
}

function validateUpdatePassword(user) {
  const updatePasswordSchema = Joi.object({
    oldpassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*]).*$/)
      .required(),
    newpassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*]).*$/)
      .required(), 
  });

  const { error, value } = updatePasswordSchema.validate(user);
  return { error, value };
}

function validateLogin(user) {
  const emailSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*]).*$/)
      .message("please enter correct password")
      .required(),
  });

  const { error, value } = emailSchema.validate(user);
  return { error, value };
}

module.exports = {
  validateUserSignUp,
  validateUserUpdate,
  validateForgetPassword,
  validateUpdatePassword,
  validateLogin,
};
