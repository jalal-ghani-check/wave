const express = require("express");
const router = express.Router();
const post = require("../controllers/post.Controller");
const tokenMiddleware = require("../middlewares/token.user.middleware");

router.post("/create", tokenMiddleware, post.addPost);
router.get("/user", tokenMiddleware, post.getPostsByUserId);
router.put("/update/:id", tokenMiddleware, post.updatePost);
router.get("/radius", post.specificDistance);
router.get("/category/:id", post.getPostsByCategoryId);
router.get("/all", post.allPosts);
router.get("/:id", post.SpecificPost);
router.delete("/delete/:id", post.deletePost);
router.post("/get-posts", post.SearchPosts);
router.get("/filters-new-posts/:days", post.lastDays);

module.exports = router;
