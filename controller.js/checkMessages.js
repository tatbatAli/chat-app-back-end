export const checkMessages = async (req, res, next) => {
  try {
    const messagesCount = await Messages.countDocuments();
    res.status(200).json({ hasMessages: messagesCount > 0 });
  } catch (error) {
    res.status(404).json({ err: error });
  }
};
