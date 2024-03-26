const prisma = require("../configs/databaseConfig");

// const {  validatechat } = require("../validations/chat ");

require("dotenv").config();

exports.getMessages = async function getChatMessagesByChatId(req, res) {
  try {
    const chatId = req.params.id;
    const chatMessages = await prisma.chatMessages.findMany({
      where: {
        chatId: chatId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (chatMessages.length === 0) {
      return res
        .status(404)
        .json({ error: "No chat messages found for this Chat Id" });
    }
    console.log(chatMessages);
    return res.status(200).json({ message: chatMessages });
  } catch (error) {
    if (error.code === "P2023") {
      return res.status(404).json({ error: "Invalid Chat Id" });
    }
    console.error("Error fetching chat messages:", error);
    throw error;
  }
};

exports.updateChatMessage = async function getChatMessagesByChatId(req, res) {
  try {
    const messageId = req.params.id;
    const newBody = req.body.newBody;
    const userId = req.user.id;
    const isMessage = await prisma.chatMessages.findUnique({
      where: {
        id: messageId,
      },
      include: {
        sender: true,
        receiver: true,
      },
    });
    if (!isMessage) {
      return res.status(404).json({ message: "Chat Message not found" });
    }
    const isAuthorized =
      isMessage.sender.id === userId || isMessage.receiver.id === userId;

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this post" });
    }

    const newMessage = await prisma.chatMessages.update({
      where: {
        id: messageId,
      },
      data: {
        body: newBody,
      },
    });
    return res.status(200).json({ updatedMessage: newMessage });
  } catch (error) {
    if (error.code === "P2023") {
      return res.status(404).json({ error: "Invalid Chat Message Id" });
    }
    console.error(error);
    //throw error;
  }
};

exports.deleteChatMessage = async function getChatMessagesByChatId(req, res) {
  try {
    const messageId = req.params.id;
    const isMessage = await prisma.chatMessages.findUnique({
      where: {
        id: messageId,
      },
    });
    if (!isMessage) {
      return res.status(404).json({ error: "Chat Message Not Found" });
    }
    const newMessage = await prisma.chatMessages.delete({
      where: {
        id: messageId,
      },
    });
    return res.status(200).json({ message: "Message Deleted Successfully" });
  } catch (error) {
    if (error.code === "P2023") {
      return res.status(404).json({ error: "Invalid Chat Message Id" });
    }
    console.error(error);
  }
};
