const express = require("express");
const router = express.Router();

const chatMessages = require("../controllers/chatsMessagesController");

//router.post("/add", users.addUser);

router.post("/send-chat", chatMessages.sendMessage);
router.put("/update-chat/:id", chatMessages.updateChatMessage);
router.get("/get-chat/:senderId/:receiverId", chatMessages.getChatMessages);
// router.get("/Show-chats-of-id", chats.sendMessage);

module.exports = router;
