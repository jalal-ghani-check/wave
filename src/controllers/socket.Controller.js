const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const prisma = require("../configs/databaseConfig");
const admin = require("firebase-admin");
const { sendCustomNotification } = require("./notificationController");
const { receiveMessageOnPort } = require("worker_threads");

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 7000;
const secretKey = process.env.SECRETKEY;

let authenticatedUsers = {};

io.use((socket, next) => {
  const token = socket.handshake.headers.authorization;
  if (!token) {
    return next(new Error("Authentication token is required"));
  }
  try {
    const decoded = jwt.verify(token, secretKey);
    socket.userID = decoded.id;
    socket.username = decoded.firstName;
    return next();
  } catch (error) {
    if (error.message === "jwt expired") {
      console.log("Token Has Expired");
    }
    return next(new Error("Invalid or expired token"));
  }
});

app.get("/", (req, res) => {
  res.send("Server is running!");
});

io.on("connection", (socket) => {
  console.log("A client is being connected with an id of:", socket.userID);
  authenticatedUsers[socket.userID] = socket;
  socket.emit("hello", "Welcome to the app!");
  socket.on("privateMessage", async ({ recipientId, message, chatId }) => {
    const recipientSocket = authenticatedUsers[recipientId];
    try {
      if (!chatId) {
        socket.emit("errorMessage", "Chat ID doesn't exist");
        return;
      }
      const existingChat = await prisma.chat.findFirst({
        where: {
          AND: [
            { id: chatId },
            {
              OR: [
                {
                  AND: [
                    { senderId: socket.userID },
                    { receiverId: recipientId },
                  ],
                },
                {
                  AND: [
                    { senderId: recipientId },
                    { receiverId: socket.userID },
                  ],
                },
              ],
            },
          ],
        },
      });

      if (existingChat) {
        chatId = existingChat.id;
      }
      const newChatMessage = await prisma.chatMessages.create({
        data: {
          body: message,
          sender: { connect: { id: socket.userID } },
          receiver: { connect: { id: recipientId } },
          chat: { connect: { id: chatId } },
        },
      });
      console.log("save");
      console.log("Chat message saved:", newChatMessage);
      if (recipientSocket) {
        recipientSocket.emit("privateMessage", {
          senderId: socket.userID,
          message: message,
        });
        console.log("sent ");
        console.log("Notification ");
        await sendCustomNotification(
          "A new Message ",
          `A new message came from ${socket.userID}`,
          recipientSocket.token
        );
      } else {
        socket.emit("errorMessage", "Recipient is offline");
      }
    } catch (error) {
      console.error("Error saving or sending chat message:", error);
      socket.emit("errorMessage", "Error saving or sending chat message");
    }
  });

  socket.on("disconnect", async () => {
    delete authenticatedUsers[socket.userID];
    console.log("User disconnected:", socket.userID);
    socket.broadcast.emit("userDisconnected", socket.userID);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
