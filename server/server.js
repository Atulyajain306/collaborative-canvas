const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("client"));

let users = 0;

// Global shared history
let globalHistory = [];
let globalRedoStack = [];

io.on("connection", (socket) => {
  users++;
  io.emit("userCount", users);
  console.log(`${socket.id} connected (Users: ${users})`);
  // Send the current state if it exists
  if (globalHistory.length > 0) {
    socket.emit("syncCanvas", globalHistory[globalHistory.length - 1]);
  }

  // Drawing
  socket.on("startPath", (data) => socket.broadcast.emit("startPath", data));

  socket.on("drawing", (data) => socket.broadcast.emit("drawing", data));

  // Save canvas state before editing
socket.on("saveState", (dataURL) => {
  globalHistory.push(dataURL);
  if (globalHistory.length > 100) globalHistory.shift();
});

  socket.on("endPath", (dataURL) => {
  socket.broadcast.emit("endPath");
  globalHistory.push(dataURL);
  if (globalHistory.length > 100) globalHistory.shift();
  globalRedoStack = [];
});

 socket.on("undo", () => {
  if (globalHistory.length > 0) {
    // Move last state to redo stack
    const lastState = globalHistory.pop();
    globalRedoStack.push(lastState);

    if (globalHistory.length > 0) {
      // Show previous canvas state
      const newState = globalHistory[globalHistory.length - 1];
      io.emit("updateCanvas", newState);
    } else {
      io.emit("clearCanvas");
    }
  } else {
    
    io.emit("clearCanvas");
  }
});


socket.on("redo", () => {
  if (globalRedoStack.length > 0) {
    const redoState = globalRedoStack.pop();
    globalHistory.push(redoState);
    io.emit("updateCanvas", redoState);
  }
});


  //Cursor tracking
  socket.on("cursorMove", (data) => {
    socket.broadcast.emit("cursorMove", { id: socket.id, ...data });
  });

  socket.on("disconnect", () => {
    users--;
    io.emit("userCount", users);
    io.emit("removeCursor", socket.id);
    console.log(`${socket.id} disconnected (Users: ${users})`);

    if (users === 0) {
      globalHistory = [];
      globalRedoStack = [];
      console.log("All users left — global history cleared");
    }
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
