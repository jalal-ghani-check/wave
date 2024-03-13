const Joi = require("joi");

function validateCategory(user) {
  const categoryCreateUpdate = Joi.object({
    name: Joi.string().required(),
  });

  const { error, value } = categoryCreateUpdate.validate(user);
  return { error, value };
}

module.exports = {
  validateCategory,
};
