const prisma = require("../configs/databaseConfig");

require("dotenv").config();
const {
  categoryUpdateCreate,
} = require("../middlewares/validation.message.middleware");

exports.addcategory = async (req, res) => {
  try {
    const validateCategory = await categoryUpdateCreate(req, res);

    if (validateCategory.status !== 200) {
      return res.status(validateCategory.status).json(validateCategory.data);
    }

    const { name } = validateCategory.data;
    const Categoryy = await prisma.category.create({
      data: {
        name,
      },
    });

    return res.status(201).json({
      message: "Category created successfully",
      data: Categoryy,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deletecategory = async (req, res) => {
  try {
    const categoryId = req.params.id; // contain category id

    const iscategory = await prisma.category.findUnique({
      where: {
        id: categoryId, // contain message data
      },
    });

    if (!iscategory) {
      return res.status(404).json({ message: "Category Not Found" });
    }

    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });

    return res.status(200).json({ message: "Category Deleted Successfully" });
  } catch (error) {
    if (error.code === "P2023") {
      return res.status(404).json({ message: "Invalid Id format" });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updatecategory = async (req, res) => {
  const validateCategory = await categoryUpdateCreate(req, res);

  if (validateCategory.status !== 200) {
    return res.status(validateCategory.status).json(validateCategory.data);
  }

  const { name } = validateCategory.data;

  const categoryId = req.params.id;
  try {
    if (validateCategory.status !== 200) {
      return res.status(validateCategory.status).json(validateCategory.data);
    }

    const { name } = validateCategory.data;

    const categoryId = req.params.id;

    const isCategory = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!isCategory) {
      return res.status(404).json({ message: "Category Not Found" });
    }

    const updateCategory = await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        name,
      },
    });

    return res
      .status(201)
      .json({ message: "Category Updated Successfully", data: updateCategory });
  } catch (error) {
    if (error.code === "P2023") {
      return res.status(404).json({ message: "Invalid Id format" });
    }

    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.SpecificCategory = async (req, res) => {
  const categoryId = req.params.id;
  const isCategory = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!isCategory) {
    return res.status(404).json({ message: "Category Not Found" });
  }

  return res
    .status(200)
    .json({ message: "Category Fetched Successfully", data: isCategory });
};

exports.allcategories = async (req, res) => {
  const categoryId = req.params.id;
  const isCategory = await prisma.category.findMany({
    where: {
      id: categoryId,
    },
  });

  if (!isCategory) {
    return res.status(404).json({ message: "Category Not Found" });
  }

  return res
    .status(200)
    .json({ message: "Message Fetched Successfully", data: isCategory });
};
