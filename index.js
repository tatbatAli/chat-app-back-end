import express from "express";
import mongoose from "mongoose";
import Messages from "./modules/Messages.js";
import User from "./modules/Users.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

const port = process.env.PORT;
const allowedOrigins = ["http://localhost:5173", "http://localhost:4000"];
const app = express();
const server = http.createServer(app);
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
  },
});

io.on("connection", (socket) => {
  socket.on("send message", (message) => {
    socket.broadcast.emit("recieved message", message);
  });
});

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by Cors"));
      }
    },
  })
);

app.post("/", async (req, res, next) => {
  const { user, message, timeOfMessage, dayOfMessage } = req.body;
  if (!user || !message || !timeOfMessage || !dayOfMessage) {
    console.log("nothing here");
    return res.status(400).json({ msg: "Missing Required Field" });
  }
  try {
    let username = await User.findOne({ user });
    if (!username) {
      username = await User.create({ user });
    }
    const conversation = await Messages.create({
      message,
      timeOfMessage,
      dayOfMessage,
      user: username.user,
    });
    res.status(200).json({ message: conversation });
  } catch (error) {
    res.status(400).json({ msg: "Page Not found" });
  }
});

app.post("/signIn", (req, res, next) => {
  const { username, password, passwordConfirmation } = req.body;

  if (!username || !password || !passwordConfirmation) {
    return res.status(400).json({ msg: "Missing Required Fields" });
  }
});

app.get("/", async (req, res, next) => {
  try {
    const findMessages = await Messages.find().populate("user");
    res.status(200).json(findMessages);
  } catch (error) {
    res.status(200).json({ "finding a message": error });
  }
});

app.get("/checkMessages", async (req, res, next) => {
  try {
    const messagesCount = await Messages.countDocuments();
    res.status(200).json({ hasMessages: messagesCount > 0 });
  } catch (error) {
    res.status(404).json({ err: error });
  }
});

app.post("*", (req, res, next) => {
  res.status(500).json({ msg: "Server Error" });
});

mongoose
  .connect("mongodb://localhost:27017/chatApp")
  .then(() => {
    console.log("connected");
    server.listen(port, () => {
      console.log(`running on port:${port}`);
    });
  })
  .catch(() => console.log("conection failed"));
