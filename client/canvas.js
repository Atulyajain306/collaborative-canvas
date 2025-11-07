export class CanvasManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.colorInput = document.getElementById("color");
    this.sizeInput = document.getElementById("size");
    this.tool = "brush";
    this.isDrawing = false;
    this.history = [];
    this.redoStack = [];
    this.remoteCursors = {};

    this.saveState();
  }

  saveState() {
    this.history.push(this.canvas.toDataURL());
    if (this.history.length > 50) this.history.shift();
  }

  // ✅ FIXED: Accurate mouse position even when canvas is scaled
  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  applyCtx(tool, color, size) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = size;
    this.ctx.lineCap = "round";
    this.ctx.globalCompositeOperation =
      tool === "eraser" ? "destination-out" : "source-over";
  }

  startLocalPath(pos) {
    this.isDrawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
  }

  drawLocal(pos) {
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
  }

  stopLocalDrawing() {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.ctx.closePath();
      this.saveState();
    }
  }

  // Remote drawing
  startRemotePath({ x, y, color, size, tool }) {
    this.applyCtx(tool, color, size);
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  drawRemote({ x, y, color, size, tool }) {
    this.applyCtx(tool, color, size);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  endRemotePath() {
    this.ctx.closePath();
  }

  undo() {
    if (this.history.length <= 1) return;
    this.redoStack.push(this.history.pop());
    const img = new Image();
    img.src = this.history[this.history.length - 1];
    img.onload = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(img, 0, 0);
    };
  }

  redo() {
    if (this.redoStack.length === 0) return;
    const redoState = this.redoStack.pop();
    this.history.push(redoState);
    const img = new Image();
    img.src = redoState;
    img.onload = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(img, 0, 0);
    };
  }

  updateRemoteCursor({ id, x, y, color }) {
    if (!this.remoteCursors[id]) {
      const div = document.createElement("div");
      div.className = "remote-cursor";
      div.style.background = color;
      div.style.position = "absolute";
      div.style.width = "10px";
      div.style.height = "10px";
      div.style.borderRadius = "50%";
      div.style.pointerEvents = "none";
      div.style.transform = "translate(-50%, -50%)";
      document.body.appendChild(div);
      this.remoteCursors[id] = div;
    }
    this.remoteCursors[id].style.left = `${x}px`;
    this.remoteCursors[id].style.top = `${y}px`;
  }

  removeRemoteCursor(id) {
    const cursor = this.remoteCursors[id];
    if (cursor) {
      cursor.remove();
      delete this.remoteCursors[id];
    }
  }
}
