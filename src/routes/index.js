const express = require("express");
const users = require("./users");
const admins = require("./admins");
const message = require("./messages");
const category = require("./categories");
const chat = require("./chat");
const chatMessages = require("./chatMessage");

const router = express.Router();

router.use("/users", users);
router.use("/admins", admins);
router.use("/category", category);
router.use("/message", message);
router.use("/chats", chat);
router.use("/chatMessages", chatMessages);

module.exports = router;
