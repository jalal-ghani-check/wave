const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 7000;
let connectedClients = {}; // Store connected clients

app.get("/", (req, res) => {
  res.send("Server is running!"); // A simple response to confirm that the server is running
});

io.on("connection", (socket) => {
  console.log("A client is being connected with an id of:", socket.id);

  // Store socket id of connected client
  connectedClients[socket.id] = socket;

  socket.emit("hello", "Hello from server!"); // Emitting "hello" message to the client

  // Listen for messages from the client
  socket.on("clientMessage", (message) => {
    console.log(`Received message from client ${socket.id}: ${message}`);
  });

  // Listen for messages from client2
  socket.on("client2Message", (message) => {
    console.log(`Received message from client2 ${socket.id}: ${message}`);
  });

  // Example of sending a message to this specific client
  socket.on("privateMessage", (message) => {
    socket.emit("privateMessage", `This is a private message: ${message}`);
  });

  // Example of broadcasting a message to all clients except this one
  socket.on("broadcast", (message) => {
    socket.broadcast.emit("broadcast", `Broadcasting: ${message}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
