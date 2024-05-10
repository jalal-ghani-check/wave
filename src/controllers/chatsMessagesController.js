const prisma = require("../configs/databaseConfig");

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
    const chatMessagesCount = await prisma.chatMessages.count()   


    if (chatMessages.length === 0) {
      return res
        .status(404)
        .json({ error: "No chat messages found for this Chat Id" });
    }
    console.log(chatMessages);
    return res.status(200).json({ message: chatMessages , total : chatMessagesCount});
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
      isMessage.sender.id === userId // || isMessage.receiver.id === userId;

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
        messageBody: newBody,
      },
    });
    return res.status(200).json({ updatedMessage: newMessage });
  } catch (error) {
    if (error.code === "P2023") {
      return res.status(404).json({ error: "Invalid Chat Message Id" });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
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

exports.oneChatMessage = async function oneChatMessage(req,res){
  
  try {
    const chatMessageId = req.params.id;
    const isMessage = await prisma.chatMessages.findUnique({
      where: {
        id: chatMessageId,
      },
    });

    if (!isMessage) {
      return res.status(404).json({ message: "Message Not Found" });
    }
    return res
      .status(200)
      .json({ message: "Message Fetched Successfully", data: isMessage });
  } catch (error) {
    if (error.code === "P2023") {
      return res.status(404).json({ message: "Invalid Id format" });
    }
      console.log(error);
      return res.status(500).json({ error: "Internal Server Error" });   
   
  }
}
