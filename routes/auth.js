import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../modules/Users.js";
import Token from "../modules/Tokens.js";

const router = express.Router();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

router.post("/signIn", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: "Missing Required Fields" });
  }

  try {
    const userExist = await User.findOne({ username });
    if (userExist) {
      return res.status(400).json({ msg: "username already exist" });
    }

    const difficulty = 10;
    const hashedPassword = await bcrypt.hash(password, difficulty);

    const userData = await User.create({
      username,
      password: hashedPassword,
    });

    const payload = { username };

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: "15min",
    });

    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: "30d",
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

    res
      .status(201)
      .json({ success: true, User_Data: userData, User_Token: userToken });
  } catch (error) {
    res.status(400).json({ success: false, data: "Page Not found" });
  }
});

router.post("/token", async (req, res) => {
  const { authToken } = req.body;

  const storedToken = await Token.findOne({ refreshToken: authToken });
  if (!storedToken) {
    return res.sendStatus(401);
  }
  jwt.verify(authToken, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(400).json({ err });

    const newAccessToken = jwt.sign(
      { username: user.username },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "20s" }
    );

    res.cookie("authToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res.json({ accessToken: newAccessToken });
  });
});

router.post("/logout", async (req, res) => {
  const { authToken } = req.cookies;

  await Token.deleteOne({ authToken });

  res.clearCookie("authToken");

  res.status(200).json({ msg: "logged out" });
});

export default router;
