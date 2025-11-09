export class CanvasSocket {
  constructor(manager, updateUserCount) {
    this.manager = manager;
    this.socket = io();
    this.updateUserCount = updateUserCount;
    this.setup();
  }

  setup() {
    this.socket.on("userCount", (count) => this.updateUserCount(count));
    this.socket.on("startPath", (data) => this.manager.startRemotePath(data));
    this.socket.on("drawing", (data) => this.manager.drawRemote(data));
    this.socket.on("endPath", () => this.manager.endRemotePath());
    this.socket.on("updateCanvas", (dataURL) =>
      this.manager.updateCanvasFromImage(dataURL)
    );
    this.socket.on("syncCanvas", (dataURL) =>
      this.manager.updateCanvasFromImage(dataURL)
    );
   this.socket.on("clearCanvas", () => {
    this.manager.ctx.clearRect(0, 0, this.manager.canvas.width, this.manager.canvas.height);
  this.manager.history = [];
  this.manager.redoStack = [];
});
    this.socket.on("cursorMove", (data) =>
      this.manager.updateRemoteCursor(data)
    );
    this.socket.on("removeCursor", (id) =>
      this.manager.removeRemoteCursor(id)
    );
  }

  emitStartPath(data) {
    this.socket.emit("startPath", data);
  }

  emitDrawing(data) {
    this.socket.emit("drawing", data);
  }

  emitEndPath(dataURL) {
    this.socket.emit("endPath", dataURL);
  }

  emitUndo() {
    this.socket.emit("undo");
  }

  emitRedo() {
    this.socket.emit("redo");
  }

  emitCursorMove(data) {
    this.socket.emit("cursorMove", data);
  }

  emitSaveState(dataURL) {
  this.socket.emit("saveState", dataURL);
}

}
