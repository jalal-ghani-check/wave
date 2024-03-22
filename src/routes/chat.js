const express = require("express");
const router = express.Router();

const chats = require("../controllers/chatsController");

router.post("/create-chat", chats.createChat);
router.get("/get-chat-of-specific-user/:id", chats.getUserContactList);
router.get(
  "/get-chat-of-specific-receiver/:id",
  chats.checkReceiverAndConnectionExists
);
router.get("/get-chat-by-id", chats.getConnectionNames);

module.exports = router;
