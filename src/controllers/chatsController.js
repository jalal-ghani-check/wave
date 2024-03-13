const prisma = require("../configs/databaseConfig");

// const {  validatechat } = require("../validations/chat ");

require("dotenv").config();

exports.createChat = async (req, res) => {
  try {
    const { senderId, receiverId, messageId } = req.body;
    const chat = await prisma.chat.create({
      data: {
        senderId,
        receiverId,
        messageId,
      },
    });
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserContactList = async (req, res) => {
  try {
    const { senderId } = req.params;

    const chats = await prisma.chat.findMany({
      where: {
        senderId: senderId,
      },
      select: {
        receiverId: true,
      },
    });

    const uniqueReceiverIds = [
      ...new Set(chats.map((chat) => chat.receiverId)),
    ];

    res.json({ receiverIds: uniqueReceiverIds });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
