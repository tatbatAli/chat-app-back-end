import express from "express";
import mongoose from "mongoose";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { Server } from "socket.io";
import messageRoutes from "./routes/messages.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";

dotenv.config();
const port = process.env.PORT;
const allowedOrigins = ["http://localhost:5173"];

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by Cors"));
      }
    },
  })
);

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

app.use("/messages", messageRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

app.post("*", (req, res) => {
  res.status(500).json({ msg: "Server Error" });
});

mongoose
  .connect("mongodb://localhost:27017/chatApp")
  .then(() => {
    console.log("connected");
    server.listen(port, () => {
      console.log(`running on port: ${port}`);
    });
  })
  .catch(() => console.log("connection failed"));
