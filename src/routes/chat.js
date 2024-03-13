const express = require("express");
const router = express.Router();

const chats = require("../controllers/chatsController");

router.get(
  "/get-chat-of-specific-user/:senderId/receivers",
  chats.getUserContactList
);
router.post("/create-chat", chats.createChat);

module.exports = router;
