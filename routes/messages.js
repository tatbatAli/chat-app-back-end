import express from "express";
import Messages from "../modules/Messages.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { user, message, timeOfMessage, dayOfMessage } = req.body;
  if (!user || !message || !timeOfMessage || !dayOfMessage) {
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

router.get("/", async (req, res) => {
  try {
    const findMessages = await Messages.find().populate("user");
    res.status(200).json(findMessages);
  } catch (error) {
    res.status(400).json({ "finding a message": error });
  }
});

router.get("/checkMessages", async (req, res) => {
  try {
    const messagesCount = await Messages.countDocuments();
    res.status(200).json({ hasMessages: messagesCount > 0 });
  } catch (error) {
    res.status(404).json({ err: error });
  }
});

export default router;
