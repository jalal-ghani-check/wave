const Joi = require("joi");

function createChat(user) {
  const chatSchema = Joi.object({
    otherUserId: Joi.string().length(24).required(),
    postId: Joi.string().length(24).required(),
  });

  const { error, value } = chatSchema.validate(user);
  return { error, value };
}

function validateIdParams(user) {
  const schema = Joi.object({
    id: Joi.string().length(24).required(),
  });
  return schema.validate(user);
}

function validateIdBody(user) {
  const schema = Joi.object({
    user2Id: Joi.string().length(24).required(),
  });
  return schema.validate(user);
}

function validateChatId(user) {
  const schema = Joi.object({
    chatId: Joi.string().length(24).required(),
  });
  return schema.validate(user);
}

module.exports = {
  createChat,
  validateIdParams,
  validateIdBody,
  validateChatId,
};
