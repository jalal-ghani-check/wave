const Joi = require("joi");

function messageScheema(user) {
  const messageSchema = Joi.object({
    title: Joi.string().min(3).max(30).required(),
    body: Joi.string().min(3).max(200).required(),
    longitude: Joi.number().required(),
    latitude: Joi.number().required(),
    address: Joi.string().required(),
    userId: Joi.string().required(),
    categoryId: Joi.string().required(),
  });

  const { error, value } = messageSchema.validate(user);
  return { error, value };
}

function messageUpdate(user) {
  const messageUpdateSchema = Joi.object({
    title: Joi.string().min(3).max(30).optional(),
    body: Joi.string().min(3).max(200).optional(),
    longitude: Joi.number().optional(),
    latitude: Joi.number().optional(),
    address: Joi.string().optional(),
    // userId: Joi.string().allow(null).optional(),
    categoryId: Joi.string().allow(null).optional(),
  });

  const { error, value } = messageUpdateSchema.validate(user);
  return { error, value };
}

module.exports = {
  messageScheema,
  messageUpdate,
};
