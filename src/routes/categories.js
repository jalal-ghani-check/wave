const express = require("express");
const router = express.Router();

const categories = require("../controllers/categoriesController");
router.post("/create", categories.addcategory);
router.put("/update/:id", categories.updatecategory);
router.delete("/delete/:id", categories.deletecategory);
router.get("/all", categories.allcategories);
router.get("/:id", categories.SpecificCategory);
router.post("/get-category", categories.SearchCategory);

module.exports = router;
