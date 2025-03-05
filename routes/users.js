import express from "express";
import User from "../modules/Users.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const getUser = await User.find({}, "username");
    res.status(200).json(getUser);
  } catch (error) {
    res.status(404).json({ msg: "error fetching user", error });
  }
});

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json("user not found");
    }
  } catch (error) {
    res.status(500).json("server error");
  }
});

export default router;
