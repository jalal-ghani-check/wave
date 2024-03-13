const prisma = require("../configs/databaseConfig");
const { messageScheema, messageUpdate } = require("../validations/message");

const express = require("express");
const app = express();
const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);
const io = socketIo(server);
server.listen(6000);

require("dotenv").config();
io.on("connection", (socket) => {
  console.log("A client connected");
});

exports.addMessage = async (req, res) => {
  try {
    const { error, value } = messageScheema(req.body);

    if (error) {
      return res
        .status(400)
        .json({ message: `Validation error: ${error.details[0].message}` });
    }

    const { title, body, address, longitude, latitude, userId, categoryId } =
      value;

    const isUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    const isCategory = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!isCategory) {
      return res.status(404).json({ message: "Message Category not found" });
    }
    if (!isUser) {
      return res.status(404).json({ message: "Message User not found" });
    }

    const messagee = await prisma.message.create({
      data: {
        title,
        body,
        address,
        longitude,
        latitude,
        userId,
        categoryId,
      },
    });

    return res.status(201).json({
      message: "Message created successfully",
      data: messagee,
    });
  } catch (error) {
    if (error.code === "P2023") {
      if (error.message.includes("User")) {
        return res.status(404).json({ message: "Invalid User Id format" });
      } else if (error.message.includes("Category")) {
        return res.status(404).json({ message: "Invalid Category Id format" });
      }
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id; // contain message id

    const isMessage = await prisma.message.findUnique({
      where: {
        id: messageId, // contain message data
      },
    });

    if (!isMessage) {
      return res.status(404).json({ message: "Message Not Found" });
    }

    await prisma.message.delete({
      where: {
        id: messageId,
      },
    });

    io.emit("deleteMessage", messageId);

    return res.status(200).json({ message: "Message Deleted Successfully" });
  } catch (error) {
    if (error.code === "P2023") {
      return res.status(404).json({ message: "Invalid Id format" });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateMessage = async (req, res) => {
  try {
    const { error, value } = messageUpdate(req.body);

    if (error) {
      return res
        .status(400)
        .json({ message: `Validation error: ${error.details[0].message}` });
    }

    const { title, body, address, longitude, latitude, categoryId } = value;

    const isMessage = await prisma.message.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (!isMessage) {
      return res.status(404).json({ message: "Message Not Found" });
    }

    if (categoryId !== undefined) {
      const isCategory = await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });

      if (!isCategory) {
        return res.status(404).json({ message: "Message Category not found" });
      }

      const updateMessage = await prisma.message.update({
        where: {
          id: req.params.id,
        },
        data: {
          title: value?.title,
          body: value?.body,
          address: value?.address,
          longitude: value?.longitude,
          latitude: value?.latitude,
          categoryId: value?.categoryId,
        },
      });

      return res
        .status(201)
        .json({ message: "Message Updated Successfully", data: updateMessage });
    }
  } catch (error) {
    if (error.code === "P2023") {
      if (error.message.includes("User")) {
        return res.status(404).json({ message: "Invalid User Id format" });
      } else if (error.message.includes("Category")) {
        return res.status(404).json({ message: "Invalid Category Id format" });
      }
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.SpecificMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const isMessage = await prisma.message.findUnique({
      where: {
        id: messageId,
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
      return res
        .status(404)
        .json({ message: "User Id or Category Id has not correct format" });
    }
    console.error(error);

    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.allMessages = async (req, res) => {
  try {
    const isMessage = await prisma.message.findMany();

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
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getMessagesByUserId = async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        userId: req.params.id,
      },
    });
    if (messages.length === 0) {
      return res
        .status(404)
        .json({ message: "No messages found for the specified User" });
    }
    return res
      .status(200)
      .json({ message: "Message Fetched Successfully", data: messages });
  } catch (error) {
    if (error.code === "P2023") {
      return res.status(404).json({ message: "Invalid Id format" });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getMessagesByCategoryId = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const messages = await prisma.message.findMany({
      where: {
        categoryId: categoryId,
      },
    });
    if (messages.length === 0) {
      return res
        .status(404)
        .json({ message: "No messages found for the specified category" });
    }
    return res
      .status(200)
      .json({ message: "Message Fetched Successfully", data: messages });
  } catch (error) {
    if (error.code === "P2023") {
      return res.status(404).json({ message: "Invalid Id format" });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// exports.replyMessage = async (req, res) => {
//   try {
//     const parentId = req.params.id;
//     const reply = req.body;

//     const isParent = await prisma.message.findUnique({
//       where: {
//         id: parentId,
//       },
//     });

//     if (!isParent) {
//       return res
//         .status(404)
//         .json({ message: "No messages found for the specified category" });
//     }

//     const messageReply = await prisma.message.create({
//       data: {
//         parentId,
//         reply,
//       },
//     });

//     io.emit("replyMessage", messageReply);

//     return res.status(201).json({
//       message: "Reply added successfully",
//       data: reply,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };
