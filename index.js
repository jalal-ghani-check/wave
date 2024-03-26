const express = require("express");
const route = require("./src/routes/index");
const app = express();
const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT;
app.use(express.json());

// app.use("/api",route);
app.use("/api", require("./src/routes"));

app.get("/ping", async (req, res) => {
  res.status(200).json({ message: "Connected" });
});

app.get('/', (req, res) => {
  res.send('Hello World!');
 });

module.exports = { io, http, server, socketIo };
const socket = require("./src/services/socket.service");

// app.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

