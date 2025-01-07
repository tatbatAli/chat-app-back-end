import messages from "../modules/Messages.js";
import User from "../modules/Users.js";

export const messageController = async (req, res, next) => {
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
};

export const getMessages = async (req, res, next) => {
  try {
    const findMessages = await Messages.find().populate("user");
    res.status(200).json(findMessages);
  } catch (error) {
    res.status(200).json({ "finding a message": error });
  }
};
