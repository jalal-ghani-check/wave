const express = require("express");
const router = express.Router();

const chatMessages = require("../controllers/chatsMessagesController");

router.get("/get-chat/:id", chatMessages.getMessages);
router.put("/update-chat/:id", chatMessages.updateChatMessage);
router.delete("/delete-chat/:id", chatMessages.deleteChatMessage);

module.exports = router;
