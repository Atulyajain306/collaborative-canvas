const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("client"));

let users = 0;

io.on("connection", (socket) => {
  users++;
  io.emit("userCount", users);
  console.log(`${socket.id} connected`);

  // Drawing events
  socket.on("startPath", (data) => socket.broadcast.emit("startPath", data));
  socket.on("drawing", (data) => socket.broadcast.emit("drawing", data));
  socket.on("endPath", () => socket.broadcast.emit("endPath"));

  // Undo/Redo
  socket.on("undo", () => socket.broadcast.emit("undo"));
  socket.on("redo", () => socket.broadcast.emit("redo"));

  // Cursor tracking
  socket.on("cursorMove", (data) => {
    socket.broadcast.emit("cursorMove", { id: socket.id, ...data });
  });

  socket.on("disconnect", () => {
    users--;
    io.emit("userCount", users);
    io.emit("removeCursor", socket.id);
    console.log(`${socket.id} disconnected`);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
