import mongoose from "mongoose";

const TokensSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
});

const Token = mongoose.model("Token", TokensSchema);

export default Token;
