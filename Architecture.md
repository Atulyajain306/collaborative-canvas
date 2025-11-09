
# 🏗️ Collaborative Canvas — System Architecture

This document explains the internal design of the **Collaborative Canvas**, including event flow, protocol design, and performance strategies.

---

## 🔄 Data Flow Diagram

- Each client emits drawing events (start, draw, stop).
- Server relays events to all other connected sockets.
- Clients reconstruct paths using the received data.

---

## 📡 WebSocket Protocol

All communication occurs over **Socket.IO** channels.  
Message schema (simplified):

| Event | Direction | Payload |
|--------|------------|----------|
| `startDrawing` | Client → Server | `{ x, y, color, size, tool }` |
| `drawing` | Client → Server | `{ x, y, color, size, tool }` |
| `stopDrawing` | Client → Server | `null` |
| `updateCanvas` | Server → All Clients | `{ dataURL }` |
| `cursorMove` | Client ↔ Server | `{ id, x, y, color }` |
| `undo`, `redo` | Client ↔ Server | `{ dataURL }` |
| `disconnect` | Client → Server | `{ id }` |

**Flow Summary:**
- Local user draws → sends stroke segments to server.
- Server rebroadcasts to all others.
- Every client updates canvas incrementally.

---

## 🕹️ Undo / Redo Strategy

- **Local State Stack:** Each client maintains a history stack of `dataURL` snapshots.
- **Global Undo Broadcast:** When a user undoes, the current image state is sent to all connected clients.
- **Fix for Eraser Bug:** Eraser operations now trigger a `saveState()` after path end, preventing full blank restore.
- **Memory Optimization:** History stack is capped (e.g., 20 states) to prevent memory leaks.

---

## ⚙️ Performance Decisions

| Strategy | Reason |
|-----------|--------|
| **Canvas snapshots (toDataURL)** | Simplifies undo/redo with minimal state logic |
| **Socket throttling** | Drawing points are sent at a limited rate to reduce bandwidth |
| **Local rendering before sync** | Reduces latency and improves UX |
| **`destination-out` for eraser** | More efficient than overlaying white strokes |
| **Single canvas context** | Avoids unnecessary re-render layers |

---

## 🤝 Conflict Resolution

- **Last-Write Wins:** When two users draw on the same pixel simultaneously, the latest broadcast overwrites the older one.
- **Operation batching:** Drawing data is chunked per path to prevent fragmented rendering.
- **Undo Safety:** Undo affects only the initiator’s canvas unless explicitly synced (global undo mode optional).
- **No Locking:** No region-level locks — free-form collaboration prioritized over precision control.

---

## 🧩 Future Enhancements

- Add persistent canvas storage via MongoDB or Redis.
- Integrate user sessions & permissions.
- Add export/download options.
- Optimize WebSocket throughput via binary deltas instead of full image sync.

---



