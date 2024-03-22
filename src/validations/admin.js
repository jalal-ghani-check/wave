const Joi = require("joi");

function validateAdminSignUp(user) {
  const adminsignUpSchema = Joi.object({
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
  const { error, value } = adminsignUpSchema.validate(user);
  return { error, value };
}

function validateForgetPassword(user) {
  const forgetpasswordSchema = Joi.object({
    newPassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*]).*$/)
      .required(),
    confirmNewPassword: Joi.string()
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
    confirmPassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*]).*$/)
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
      .pattern(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*]).*$/)
      .message("please enter correct password")
      .required(),
  });

  const { error, value } = emailSchema.validate(user);
  return { error, value };
}

module.exports = {
  validateAdminSignUp,
  validateForgetPassword,
  validateUpdatePassword,
  validateLogin,
};
