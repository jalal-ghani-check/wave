const Joi = require("joi");

function validateAdminSignUp(user) {
  const adminsignUpSchema = Joi.object({
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
    profile_image: Joi.string(),
  });

  const { error, value } = adminsignUpSchema.validate(user);
  return { error, value };
}

function validateAdminUpdate(user) {
  const adminUpdateSchema = Joi.object({
    email: Joi.string().email().allow("").optional(),
    password: Joi.string().optional(),

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

  const { error, value } = adminUpdateSchema.validate(user);
  return { error, value };
}

function validateForgetPassword(user) {
  const forgetpasswordSchema = Joi.object({
    newPassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-z]).*$/)
      .required(),
    confirmNewPassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-z]).*$/)
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
    otp: Joi.number().integer().min(1000).max(9999).required(),
  });

  const { error, value } = updatePasswordSchema.validate(user);
  return { error, value };
}

function validateLogin(user) {
  const emailSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-z]).*$/)
      .message("please enter correct password")
      .required(),
  });

  const { error, value } = emailSchema.validate(user);
  return { error, value };
}

module.exports = {
  validateAdminSignUp,
  validateAdminUpdate,
  validateForgetPassword,
  validateUpdatePassword,
  validateLogin,
};
