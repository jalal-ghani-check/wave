const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const prisma = require("../configs/databaseConfig");
const {
  sendCustomNotification,
} = require("../controllers/notificationController");

const { io, chatt} = require("../../index");

dotenv.config();
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

io.on("connection", (socket) => {
  authenticatedUsers[socket.userID] = socket;
  socket.emit("hello", "Welcome to the app!");
  socket.on("privateMessage", async ({ recipientId, message, chatId }) => {
    const recipientSocket = authenticatedUsers[recipientId];
    try {
      if (!chatId) {
        socket.emit("errorMessage", "Chat ID doesn't exist");
        return;
      }
      if (chatId.length !== 24) {
        socket.emit("errorMessage", "Invalid Chat ID");
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

      if (!existingChat) {
        socket.emit(
          "errorMessage",
          "Chat does not exist or does not involve both users"
        );
        return;
      }

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
      if (recipientSocket) {
        recipientSocket.emit("privateMessage", {
          senderId: socket.userID,
          message: message,
        });
        await sendCustomNotification(
          "A new Message ",
          `A new message came from ${socket.userID}`,
          recipientSocket.token
        );
      } else {
        socket.emit("errorMessage", "Recipient is offline");
      }
    } catch (error) {
      if (error.code === "P2023") {
        console.error("Invalid Id Format");
      }
      socket.emit("errorMessage", "Error saving or sending chat message");
    }
  });

  socket.on("disconnect", async () => {
    delete authenticatedUsers[socket.userID];
    socket.broadcast.emit("userDisconnected", socket.userID);
  });
});
