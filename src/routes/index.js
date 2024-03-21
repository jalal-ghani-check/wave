const express = require("express");
const users = require("./users");
const admins = require("./admins");
const posts = require("./post");
const category = require("./categories");
const chat = require("./chat");
const chatMessages = require("./chatMessage");
const notification = require("./notification");

const router = express.Router();

router.use("/users", users);
router.use("/admins", admins);
router.use("/category", category);
router.use("/post", posts);
router.use("/chats", chat);
router.use("/chatMessages", chatMessages);
router.use("/notification", notification);

module.exports = router;
