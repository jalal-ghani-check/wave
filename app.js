const express = require("express");
const route = require("./src/routes/index");
const app = express();
const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT;
app.use(express.json());

app.use(route);

app.get("/ping", async (req, res) => {
  res.status(200).json({ message: "Connected" });
});

module.exports = { io, http, server, socketIo };
const socket = require("./src/services/socket.service");

// app.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
