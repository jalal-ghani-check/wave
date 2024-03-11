const express = require("express");
const users = require("./users");
const admins = require("./admins");
const message = require("./messages");
const category = require("./categories");

const router = express.Router();

router.use("/users", users);
router.use("/admins", admins);
router.use("/category", category);
router.use("/message", message);

module.exports = router;
