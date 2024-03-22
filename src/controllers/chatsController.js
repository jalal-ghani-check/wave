const prisma = require("../configs/databaseConfig");

// const {  validatechat } = require("../validations/chat ");

require("dotenv").config();

exports.createChat = async (req, res) => {
  try {
    const { user1Id, user2Id, postId } = req.body;
    const user1 = await prisma.user.findUnique({
      where: {
        id: user1Id,
      },
    });
    if (!user1) {
      res.status(400).json("No user1 exist with this id ");
    }
    const user2 = await prisma.user.findUnique({
      where: {
        id: user2Id,
      },
    });
    if (!user2) {
      res.status(400).json("No user2 exist with this id ");
    }
    if (user1.id === user2.id) {
      res.status(400).json("user1 and user2 must have different ids");
    }

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        chats: true,
      },
    });

    if (!post) {
      return res.status(400).json("No post exists with this id");
    }
    const chat = post.chats.find(
      (chat) =>
        (chat.senderId === user1Id && chat.receiverId === user2Id) ||
        (chat.senderId === user2Id && chat.receiverId === user1Id)
    );

    if (chat) {
      return res.status(400).json("Chat already exists between these users");
    }
    const senderProfileImage = user1.profile_image;
    const senderFirstName = user1.firstName;
    const senderLastName = user1.lastName;
    const receiverProfileImage = user2.profile_image;
    const receiverFirstName = user2.firstName;
    const receiverLastName = user2.lastName;

    const chatt = await prisma.chat.create({
      data: {
        senderProfileImage,
        senderFirstName,
        senderLastName,
        receiverProfileImage,
        receiverFirstName,
        receiverLastName,
        sender: {
          connect: { id: user1Id },
        },
        receiver: {
          connect: { id: user2Id },
        },
        post: {
          connect: { id: postId },
        },
      },
    });
    return res.status(200).json(chatt);
  } catch (error) {
    if (error.code === "P2023") {
      console.log("Invalid Id format");
      return res.status(400).json("Invalid Id format");
    }
    console.log(error);
  }
};

exports.getUserContactList = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res
        .status(400)
        .json({ error: "Invalid request. Please provide a userId." });
    }
    const chats = await prisma.chat.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      select: {
        receiverId: true,
        senderId: true,
      },
    });

    const uniqueIds = [
      ...new Set(chats.flatMap((chat) => [chat.receiverId, chat.senderId])),
    ];
    const filteredIds = uniqueIds.filter((id) => id !== userId);
    res.json({ userIds: filteredIds });
  } catch (error) {
    if (error.code === "P2023") {
      console.log("Invalid Id format");
      return res.status(400).json("Invalid Id format");
    }
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

exports.checkReceiverAndConnectionExists = async (req, res) => {
  try {
    const user1Id = req.params.id;
    const { user2Id } = req.body;
    const user1 = await prisma.user.findUnique({
      where: {
        id: user1Id,
      },
    });
    if (!user1) {
      return res.status(400).json("No user1 exists with this id");
    }
    const user2 = await prisma.user.findUnique({
      where: {
        id: user2Id,
      },
    });
    if (!user2) {
      return res.status(400).json("No user2 exists with this id");
    }
    const chat = await prisma.chat.findFirst({
      where: {
        senderId: user1Id,
        receiverId: user2Id,
      },
    });

    if (!chat) {
      return res.status(400).json("user2 not found !!");
    }
    return res.status(200).json({
      message: `Contact Exist with the name of  :${user2.firstName} ${user2.lastName}`,
    });
  } catch (error) {
    if (error.code === "P2023") {
      console.log("Invalid Id format");
      return res.status(400).json("Invalid Id format");
    }
    console.log(error);
    return res.status(500).json({
      error: "An error occurred while checking the user2 and connection",
    });
  }
};

exports.getConnectionNames = async (req, res) => {
  try {
    const { chatId } = req.body;

    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    if (!chat) {
      return res.status(400).json("No chat exists with this id");
    }

    const user1Name = `${chat.sender.firstName} ${chat.sender.lastName}`;
    const user2Name = `${chat.receiver.firstName} ${chat.receiver.lastName}`;

    return res.status(200).json({
      senderName: user1Name,
      receiverName: user2Name,
    });
  } catch (error) {
    if (error.code === "P2023") {
      console.log("Invalid Id format");
      return res.status(400).json("Invalid Id format");
    }
    console.log(error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching connection names" });
  }
};
