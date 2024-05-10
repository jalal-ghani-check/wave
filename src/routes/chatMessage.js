const express = require("express");
const router = express.Router();

const tokenMiddleware = require("../middlewares/token.user.middleware");
const chatMessages = require("../controllers/chatsMessagesController");

router.get("/get-chat/:id", chatMessages.getMessages);
router.put("/update-chat/:id", tokenMiddleware, chatMessages.updateChatMessage);
router.delete("/delete-chat/:id", chatMessages.deleteChatMessage);
router.get("/get-single-message/:id", chatMessages.oneChatMessage);

module.exports = router;
