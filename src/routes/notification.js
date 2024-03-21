const express = require("express");
const router = express.Router();

const notification = require("../controllers/notificationController");
router.post("/createNotification", notification.sendCustomNotification);

module.exports = router;
