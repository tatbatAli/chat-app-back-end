import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  timeOfMessage: {
    type: String,
    required: true,
  },
  dayOfMessage: {
    type: String,
    required: true,
  },
  user: { type: String, required: true },
});

const Messages = mongoose.model("Message", MessageSchema);

export default Messages;
