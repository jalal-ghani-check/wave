const express = require("express");
const router = express.Router();
const tokenMiddleware = require("../middlewares/token.user.middleware");
const chats = require("../controllers/chatsController");

router.post("/create-chat", tokenMiddleware, chats.createChat);
router.get(
  "/get-chat-of-specific-user",
  tokenMiddleware,
  chats.getUserContactList
);
router.get(
  "/get-chat-of-specific-receiver",
  tokenMiddleware,
  chats.checkReceiverAndConnectionExists
);
router.get("/get-chat-by-id", chats.getConnectionNames);

module.exports = router;
