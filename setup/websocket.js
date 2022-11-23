const { Server } = require("socket.io");

const socketController = require("../controllers/websocket");

const ioSetup = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", socketController(io));
};

module.exports = ioSetup;
