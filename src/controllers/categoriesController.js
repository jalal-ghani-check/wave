const prisma = require("../configs/databaseConfig");

require("dotenv").config();
const { validateCategory } = require("../validations/category");

exports.addcategory = async (req, res) => {
  try {
    const { error, value } = validateCategory(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: `Validation error: ${error.details[0].message}` });
    }
    const { name } = value;

    const Category = await prisma.category.findFirst({
      where: {
        name,
      },
    });
    if (Category) {
      return res.status(400).json({ message: "Category Already Exist " });
    }
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

exports.updatecategory = async (req, res) => {
  try {
    const { error, value } = validateCategory(req.body);

    if (error) {
      return res
        .status(400)
        .json({ message: `Validation error: ${error.details[0].message}` });
    }

    const { name } = value;
    const Category = await prisma.category.findFirst({
      where: {
        name,
      },
    });
    if (Category) {
      return res.status(400).json({ message: "Category Already Exist " });
    }
    const isCategory = await prisma.category.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (!isCategory) {
      return res.status(404).json({ message: "Category Not Found" });
    }
    const updateCategory = await prisma.category.update({
      where: {
        id: req.params.id,
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

exports.SpecificCategory = async (req, res) => {
  try {
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
  } catch (error) {
    if (error.code === "P2023") {
      return res.status(404).json({ message: "Invalid Id format" });
    }
    console.log(error);
  }
};

exports.allcategories = async (req, res) => {
  try {
    const isCategory = await prisma.category.findMany();
    const categoryCount = await prisma.category.count()   

    if (!isCategory) {
      return res.status(404).json({ message: "Category Not Found" });
    }

    return res
      .status(200)
      .json({ message: "Message Fetched Successfully", data: isCategory , total : categoryCount});
  } catch (error) {
    console.log(error);
    console.log("Internal Server Error ");
  }
};

exports.SearchCategory = async (req, res) => {
  try {
    const categorySearch = req.body.search;
    const isCategory = await prisma.category.findMany({
      where: {
        name: {
          contains: categorySearch,
          mode: "insensitive",
        },
      },
    });

    if (!isCategory) {
      return res.status(404).json({ message: "Category Not Found" });
    }

    return res
      .status(200)
      .json({ message: "Category Fetched Successfully", data: isCategory });
  } catch (error) {
    console.log(error);
  }
};
