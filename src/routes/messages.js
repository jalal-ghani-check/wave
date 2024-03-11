const express = require("express");
const router = express.Router();

const messages = require("../controllers/messages.Controller");

router.get("/category/:id", messages.getMessagesByCategoryId);
router.get("/user/:id", messages.getMessagesByUserId);
router.get("/all", messages.allMessages);
router.get("/:id", messages.SpecificMessage);
router.post("/create", messages.addMessage);
router.put("/update/:id", messages.updateMessage);
router.delete("/delete/:id", messages.deleteMessage);

//router.post("/reply/:id", messages.replyMessage);

module.exports = router;
