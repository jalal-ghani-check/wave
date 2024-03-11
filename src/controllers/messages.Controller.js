const prisma = require("../configs/databaseConfig");
const {
  messageValidation,
  messageupdateValidation,
} = require("../middlewares/validation.message.middleware");

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
    const validateMessage = await messageValidation(req, res);

    if (validateMessage.status !== 200) {
      return res.status(validateMessage.status).json(validateMessage.data);
    }
    const { title, body, address, longitude, latitude, userId, categoryId } =
      validateMessage.data;

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

    io.emit("newMessage", messagee);
    return res.status(201).json({
      message: "Message created successfully",
      data: messagee,
    });
  } catch (error) {
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
    const updateValidateMessage = await messageupdateValidation(req, res);
    if (updateValidateMessage.status !== 200) {
      return res
        .status(updateValidateMessage.status)
        .json(updateValidateMessage.data);
    }
    const { title, body, address, longitude, latitude, categoryId } =
      updateValidateMessage.data;

    const updateMessage = await prisma.message.update({
      where: {
        id: req.params.id,
      },
      data: {
        title: req.body.title,
        body: req.body.body,
        address: req.body.address,
        longitude: req.body.longitude,
        latitude: req.body.latitude,
        categoryId: req.body.categoryId,
      },
    });

    io.emit("messageUpdated", updateMessage);

    return res
      .status(201)
      .json({ message: "Message Updated Successfully", data: updateMessage });
  } catch (error) {
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
    const messageId = req.params.id;
    const isMessage = await prisma.message.findMany({
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
