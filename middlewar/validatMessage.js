export const validatMessage = (req, res, next) => {
  const { user, message, timeOfMessage, dayOfMessage } = req.body;
  if (!user || !message || !timeOfMessage || !dayOfMessage) {
    console.log("nothing here");
    return res.status(400).json({ msg: "Missing Required Field" });
  }

  next();
};
