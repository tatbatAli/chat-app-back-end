import { Server } from "socket.io";

export const setupSocket = (server, allowedOrigins) => {
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
    },
  });

  io.on("connection", (socket) => {
    socket.on("send message", (message) => {
      socket.broadcast.emit("recieved message", message);
    });
  });

  return io;
};
