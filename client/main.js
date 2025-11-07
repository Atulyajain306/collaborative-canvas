import { CanvasManager } from "./canvas.js";
import { CanvasSocket } from "./websocket.js";

const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const manager = new CanvasManager(canvas);
const socketClient = new CanvasSocket(manager, (count) => {
  document.getElementById("userList").innerText = count;
});

function getPos(e) {
  return manager.getMousePos(e);
}

canvas.addEventListener("mousedown", (e) => {
  const pos = getPos(e);
  manager.applyCtx(manager.tool, manager.colorInput.value, manager.sizeInput.value);
  manager.startLocalPath(pos);
  socketClient.emitStartPath({
    ...pos,
    color: manager.colorInput.value,
    size: manager.sizeInput.value,
    tool: manager.tool,
  });
});

canvas.addEventListener("mousemove", (e) => {
  socketClient.emitCursorMove({
    x: e.clientX,
    y: e.clientY,
    color: manager.colorInput.value,
  });
  if (!manager.isDrawing) return;
  const pos = getPos(e);
  manager.drawLocal(pos);
  socketClient.emitDrawing({
    ...pos,
    color: manager.colorInput.value,
    size: manager.sizeInput.value,
    tool: manager.tool,
  });
});

canvas.addEventListener("mouseup", () => {
  manager.stopLocalDrawing();
  socketClient.emitEndPath();
});

document.getElementById("brush").onclick = () => (manager.tool = "brush");
document.getElementById("eraser").onclick = () => (manager.tool = "eraser");
document.getElementById("undo").onclick = () => {
  manager.undo();
  socketClient.emitUndo();
};
document.getElementById("redo").onclick = () => {
  manager.redo();
  socketClient.emitRedo();
};
