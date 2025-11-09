# 🎨 Collaborative Canvas

A real-time collaborative drawing board built using **Node.js**, **Express**, and **Socket.IO**.  
Multiple users can draw simultaneously on a shared canvas with live synchronization, color and size controls, and undo/redo support.

---

## 🚀 Setup Instructions

### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/Atulyajain306/collaborative-canvas.git
cd collaborative-canvas
```

### **2️⃣ Install Dependencies **

```bash
npm install
```

### **3️⃣ Start the Server **

```bash
npm start
```

By default, it runs at http://localhost:8080

### **🧪 How to Test with Multiple Users**

Open the app in your browser — e.g. http://localhost:8080
Open another tab.
Start drawing — strokes, colors, and erasing will sync across all clients in real time.
Use Undo and Redo buttons to revert or restore changes globally.

### **🧩 Known Limitations / Bugs**

Eraser Undo Issue (Partially Fixed):
Undo right after erase can occasionally clear the canvas due to how canvas states are stored.
(Mitigated by saving state after every completed erase.)

No Persistent Storage:
Canvas resets when the server restarts.

No User Authentication:
All users draw anonymously.

No Image Export Yet:
Current version supports only in-browser collaboration.

### **⏱️ Time Spent on Project**

Setup & basic drawing	Canvas, brush & eraser tools	2 hrs
Real-time sync	WebSocket (Socket.IO) integration	3 hrs
Undo/Redo system State snapshots & edge case handling	2 hrs
Styling & cursor rendering	UI polishing & remote cursors	1 hr
Testing, debugging, deployment	Local + Render setup	2 hrs

Total  10 hours