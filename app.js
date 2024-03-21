const express = require("express");
const route = require("./src/routes/index");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const port = process.env.PORT;
app.use(express.json());
const users = require("./src/routes/users");
const socket = require("./src/controllers/socket.Controller");
const mail = require("./src/services/mailSender.service");
app.use(route);

app.get("/ping", async (req, res) => {
  res.status(200).json({ message: "Connected" });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
