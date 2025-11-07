const rooms = new Map(); // roomId -> { users: [] }

function createRoom(roomId, socketId) {
  if (!rooms.has(roomId)) rooms.set(roomId, { users: [] });
  const room = rooms.get(roomId);
  if (!room.users.includes(socketId)) room.users.push(socketId);
}

function getRoom(roomId) {
  return rooms.get(roomId) || { users: [] };
}

function removeUserFromRoom(socketId) {
  for (const [roomId, room] of rooms.entries()) {
    const index = room.users.indexOf(socketId);
    if (index !== -1) {
      room.users.splice(index, 1);
      if (room.users.length === 0) rooms.delete(roomId);
      return roomId;
    }
  }
  return null;
}

module.exports = { createRoom, getRoom, removeUserFromRoom };
