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
    this.socket.on("undo", () => this.manager.undo());
    this.socket.on("redo", () => this.manager.redo());
    this.socket.on("cursorMove", (data) => this.manager.updateRemoteCursor(data));
    this.socket.on("removeCursor", (id) => this.manager.removeRemoteCursor(id));
  }

  emitStartPath(data) {
    this.socket.emit("startPath", data);
  }

  emitDrawing(data) {
    this.socket.emit("drawing", data);
  }

  emitEndPath() {
    this.socket.emit("endPath");
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
}
