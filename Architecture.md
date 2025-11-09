
# 🏗️ Collaborative Canvas — System Architecture

This document explains the internal design of the **Collaborative Canvas**, including event flow, protocol design, and performance strategies.

---

## 🔄 Data Flow Diagram

![Data Flow Diagram](./userflow.png)

- Each client emits drawing events (start, draw, stop).
- Server relays events to all other connected sockets.
- Clients reconstruct paths using the received data.


🧠 **Flow Summary:**
1. User A draws on their canvas → emits `"drawing"` event with coordinates, color, size, and tool.
2. The server receives this event and **broadcasts** it to all other connected users.
3. Each receiving client (like User B) calls `drawRemote()` to replicate the exact stroke on their canvas.

---

## 🔌 WebSocket Protocol

**Events Emitted by Client:**
| Event | Description |
|-------|--------------|
| `startPath` | Begin a new path at given coordinates. |
| `drawing` | Send coordinates, color, size, and tool info. |
| `endPath` | End the path and push current state to history. |
| `undo` | Request global undo action. |
| `redo` | Request global redo action. |
| `cursorMove` | Send live cursor position and color. |

**Events Received by Client:**
| Event | Description |
|--------|-------------|
| `startPath` | Begin drawing a path from another user. |
| `drawing` | Continue drawing with given stroke data. |
| `endPath` | Finish the remote drawing path. |
| `updateCanvas` | Replace canvas with a new image (undo/redo). |
| `syncCanvas` | Sync with the latest global state when joining. |
| `clearCanvas` | Clear entire canvas (if history is empty). |
| `cursorMove` | Show another user’s cursor in real time. |
| `removeCursor` | Remove cursor when user disconnects. |

---

## 🔄 Undo/Redo Strategy

- The server maintains two **global stacks**:
  - `globalHistory` → stores canvas snapshots (`dataURL`) after each completed stroke.
  - `globalRedoStack` → stores undone states.

**Undo Flow:**
1. Last snapshot is popped from `globalHistory` and pushed to `globalRedoStack`.
2. Server emits `"updateCanvas"` with the previous state or `"clearCanvas"` if empty.

**Redo Flow:**
1. Pop from `globalRedoStack`, push to `globalHistory`.
2. Emit `"updateCanvas"` with that restored state.

This ensures **synchronized undo/redo across all users**, regardless of who triggered it.

---

## ⚡ Performance Decisions

- **Snapshots after strokes only:**  
  Instead of saving per-pixel changes, the app stores a `canvas.toDataURL()` only when a stroke ends (`mouseup`).  
  → Reduces network overhead and memory usage.

- **Limited history (max 100):**  
  Prevents excessive memory growth in long sessions.

- **Global event broadcasting:**  
  The server uses `socket.broadcast.emit()` to prevent redundant local updates.

- **Lazy image reloading:**  
  `updateCanvasFromImage()` clears and redraws using `<img>` to optimize rendering speed.

---

## 🤝 Conflict Resolution

- **Simultaneous Draws:**  
  Each user draws locally while receiving others’ strokes asynchronously. Since canvas updates are additive, conflicts are minimal.

- **Undo/Redo Conflicts:**  
  Undo/Redo affect the **shared global history**, not per-user.  
  When one user undoes a stroke, it reflects instantly across all clients — maintaining a **single source of truth**.

- **Disconnections:**  
  When all users disconnect, the server clears both history stacks to prevent stale state retention.

---
