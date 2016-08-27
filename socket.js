const socketio = require("socket.io");
const db = require("./db");

module.exports = function setup(app){
  const io = socketio(app, {
    path: "/api/ws"
  });
  const publicNS = io.of("/public");

  publicNS.on("connection", socket => {

    socket.on("join", room => {
      socket.room = room;
      socket.join(room);
    });

    socket.on("play", fileName => {
      socket.broadcast.emit("play", fileName);
    });
  });

  return {
    io,
    publicNS
  };
}
