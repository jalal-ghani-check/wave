const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 7000;

// Mapping of client IDs to socket objects
let connectedClients = {};

app.get("/", (req, res) => {
  res.send("Server is running!"); // A simple response to confirm that the server is running
});

io.on("connection", (socket) => {
  console.log("A client is being connected with an id of:", socket.id);

  // Add the connected client to the mapping
  connectedClients[socket.id] = socket;

  socket.emit("hello", "Welcome to the app!"); // Emitting "hello" message to the client

  // Listen for private messages from clients
  socket.on("privateMessage", ({ recipientId, message }) => {
    // Lookup the recipient's socket and send the message directly to them
    const recipientSocket = connectedClients[recipientId];
    if (recipientSocket) {
      recipientSocket.emit("privateMessage", {
        senderId: socket.id,
        message: message,
      });
    } else {
      // Handle case where recipient is not found (e.g., offline)
      socket.emit("errorMessage", "Recipient not found or offline");
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
