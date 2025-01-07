import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

export default User;
