const Joi = require("joi");
function emailValidate(user) {
  const emailSchema = Joi.object({
    email: Joi.string().email().required(),
  });
  const { error, value } = emailSchema.validate(user);
  return { error, value };
}
module.exports = {
  emailValidate,
};
