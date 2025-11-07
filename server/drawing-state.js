// server/drawing-state.js
const rooms = {};

function updateDrawingState(roomId, stroke) {
  if (!rooms[roomId]) rooms[roomId] = { strokes: [] };
  rooms[roomId].strokes.push(stroke);
}

function getDrawingState(roomId) {
  return rooms[roomId]?.strokes || [];
}

function undoStroke(roomId) {
  if (rooms[roomId]?.strokes.length) {
    rooms[roomId].strokes.pop();
  }
  return getDrawingState(roomId);
}

function clearRoom(roomId) {
  delete rooms[roomId];
}

module.exports = {
  updateDrawingState,
  getDrawingState,
  undoStroke,
  clearRoom,
};
