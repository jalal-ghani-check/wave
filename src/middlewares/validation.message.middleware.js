const Joi = require("joi");
const bcrypt = require("bcrypt");
const prisma = require("../configs/databaseConfig");

const messageSchema = Joi.object({
  title: Joi.string().min(3).max(30).required(),
  body: Joi.string().min(3).max(200).required(),
  longitude: Joi.number().required(),
  latitude: Joi.number().required(),
  address: Joi.string().required(),
  userId: Joi.string().required(),
  categoryId: Joi.string().required(),
});
const messageUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(30).optional(),
  body: Joi.string().min(3).max(200).optional(),
  longitude: Joi.number().optional(),
  latitude: Joi.number().optional(),
  address: Joi.string().optional(),
  userId: Joi.string().allow(null).optional(),
  categoryId: Joi.string().allow(null).optional(),
});

const categoryCreateUpdate = Joi.object({
  name: Joi.string().required(),
});

async function messageValidation(req, res) {
  try {
    const { title, body, address, longitude, latitude, userId, categoryId } =
      req.body;
    const validate = messageSchema.validate({
      title,
      body,
      address,
      longitude,
      latitude,
      userId,
      categoryId,
    });

    if (validate.error) {
      return res
        .status(400)
        .json({ message: validate.error.details[0].message });
    }

    const isUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    const isCategory = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!isCategory) {
      return res.status(404).json({ message: "Message Category not found" });
    }
    if (!isUser) {
      return res.status(404).json({ message: "Message User not found" });
    }
    return {
      status: 200,
      data: {
        title,
        body,
        address,
        longitude,
        latitude,
        userId,
        categoryId,
      },
    };
  } catch (error) {
    if (error.code === "P2023") {
      if (error.message.includes("User")) {
        return res.status(404).json({ message: "Invalid User Id format" });
      } else if (error.message.includes("Category")) {
        return res.status(404).json({ message: "Invalid Category Id format" });
      }
    }
  }
}

async function messageupdateValidation(req, res) {
  try {
    const messageId = req.params.id;
    const { title, body, address, longitude, latitude, categoryId } = req.body;
    const validate = messageUpdateSchema.validate({
      title,
      body,
      address,
      longitude,
      latitude,
      categoryId,
    });

    if (validate.error) {
      return res
        .status(400)
        .json({ message: validate.error.details[0].message });
    }

    const isMessage = await prisma.message.findUnique({
      where: {
        id: messageId,
      },
    });
    if (!isMessage) {
      return res.status(404).json({ message: "Message Not Found" });
    }

    if (categoryId !== undefined) {
      const isCategory = await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });

      if (!isCategory) {
        return res.status(404).json({ message: "Message Category not found" });
      }
    }
    return {
      status: 200,
      data: {
        title,
        body,
        address,
        longitude,
        latitude,
        categoryId,
      },
    };
  } catch (error) {
    if (error.code === "P2023") {
      if (error.message.includes("User")) {
        return res.status(404).json({ message: "Invalid User Id format" });
      } else if (error.message.includes("Category")) {
        return res.status(404).json({ message: "Invalid Category Id format" });
      }
    }
  }
}

async function categoryUpdateCreate(req, res) {
  try {
    const { name } = req.body;

    const schemaa = categoryCreateUpdate.validate({
      name,
    });
    if (schemaa.error) {
      return res
        .status(400)
        .json({ message: schemaa.error.details[0].message });
    }

    return {
      status: 200,
      data: {
        name,
      },
    };
  } catch (error) {
    if (error.code === "P2023") {
      return res.status(404).json({ message: "Invalid Id format" });
    }

    console.log(error);
  }
}

module.exports = {
  messageValidation,
  messageupdateValidation,
  categoryUpdateCreate,
};
