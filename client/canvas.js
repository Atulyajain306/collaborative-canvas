export class CanvasManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.colorInput = document.getElementById("color");
    this.sizeInput = document.getElementById("size");
    this.tool = "brush";
    this.isDrawing = false;
    this.remoteCursors = {};

    
    this.lastSaved = null;
  }

  
  saveState() {
    const dataURL = this.canvas.toDataURL();
    
    if (this.lastSaved !== dataURL) {
      this.lastSaved = dataURL;
      return dataURL;
    }
    return null;
  }

  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
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
    
    this.saveState();
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
    }
  }

  // Remote
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

  // Canvas state update
  updateCanvasFromImage(dataURL) {
    const img = new Image();
    img.src = dataURL;
    img.onload = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(img, 0, 0);
      // Update our local "last saved" snapshot to match
      this.lastSaved = this.canvas.toDataURL();
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
