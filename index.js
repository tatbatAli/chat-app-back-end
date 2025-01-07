import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { setupSocket } from "./config/socket.js";
import { checkMessages } from "./controller.js/checkMessages.js";
import { messageController } from "./controller.js/messageController.js";
import { validatMessage } from "./middlewar/validatMessage.js";
import { errorHandler } from "./middlewar/errorHandler.js";

const port = process.env.PORT;
const allowedOrigins = ["http://localhost:5173", "http://localhost:4000"];
const app = express();
const server = http.createServer(app);
app.use(express.json());

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

const io = setupSocket(server, allowedOrigins);

app.post("/", validatMessage, messageController);

app.get("/", validatMessage);

app.get("/checkMessages", checkMessages);

app.post("*", errorHandler);

mongoose
  .connect("mongodb://localhost:27017/chat-app-DB")
  .then(() => {
    console.log("connected");
    server.listen(port, () => {
      console.log(`running on port:${port}`);
    });
  })
  .catch(() => console.log("conection failed"));
