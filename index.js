import express from "express";
import mongoose from "mongoose";
import Messages from "./modules/Messages.js";
import User from "./modules/Users.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import bycrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import Token from "./modules/Tokens.js";

dotenv.config();
const port = process.env.PORT;
const allowedOrigins = ["http://localhost:5173", "http://localhost:4000"];
const app = express();
const server = http.createServer(app);
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
app.use(express.json());
app.use(cookieParser());

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
    const conversation = await Messages.create({
      message,
      timeOfMessage,
      dayOfMessage,
      user,
    });
    res.status(200).json({ message: conversation });
  } catch (error) {
    res.status(400).json({ msg: "Page Not found" });
  }
});

app.post("/signIn", async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: "Missing Required Fields" });
  }

  try {
    let userExist = await User.findOne({ username });
    if (userExist) {
      return res.status(400).json({ msg: "username already exist" });
    }

    const difficulty = 10;
    let hashedPassword = await bycrypt.hash(password, difficulty);

    const userData = await User.create({
      username,
      password: hashedPassword,
    });

    const payload = { username };

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: "20s",
    });

    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });

    const userToken = await Token.create({
      user: userData._id,
      accessToken,
      refreshToken,
    });

    res.cookie("authToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res.status(201).json({ User_Data: userData, User_Token: userToken });
  } catch (error) {
    res.status(400).json({ data: "Page Not found" });
    console.log(error);
  }
});

app.post("/token", async (req, res) => {
  const { authToken } = req.body;

  console.log(req.body);

  const storedToken = await Token.findOne({ refreshToken: authToken });
  if (!storedToken) {
    return res.sendStatus(401);
  }
  jwt.verify(authToken, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(400).json({ err: err });

    console.log(user);

    const newAccessToken = jwt.sign(
      { username: user.username },
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: "20s",
      }
    );

    res.cookie("authToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res.json({ accessToken: newAccessToken });
  });
});

app.post("/logout", async (req, res, next) => {
  const { authToken } = req.cookies;

  await Token.deleteOne({ authToken });

  res.clearCookie("authToken");

  res.status(200).json({ msg: "logged out " });
});

app.get("/", async (req, res, next) => {
  try {
    const findMessages = await Messages.find().populate("user");
    res.status(200).json(findMessages);
  } catch (error) {
    res.status(200).json({ "finding a message": error });
  }
});

app.get("/accessToken", async (req, res, next) => {
  try {
    const fetchAccessToken = await Token.find();
    res.status(200).json(fetchAccessToken);
  } catch (error) {
    res.status(200).json({ "finding a access token": error });
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
