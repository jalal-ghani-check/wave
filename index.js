const express = require("express");
const app = express();
const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);
const io = socketIo(server);
module.exports = { io, server };
const path = require("path");
const socket = require("./src/services/socket.service");

const port = process.env.PORT;
app.use(express.json());

app.use("/api", require("./src/routes"));

app.get("/ping", async (req, res) => {
  res.status(200).json({ message: "Connected" });
});


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/socket/test', (req, res) => {
  res.sendFile(__dirname + '/public/index-testing.html');
});

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
