# 🥽 VRSphere — Immersive VR/AR Virtual Events Platform

A **MERN-stack** virtual events platform with **WebXR 3D rooms**, **WebRTC peer-to-peer video/audio**, and **real-time Socket.IO chat** — bringing remote collaboration to life in the browser. 

Recently updated with a **Realistic Premium Dark Mode UI** featuring true glassmorphism, Framer Motion animations, and responsive interactions.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🎓 **3D Rooms** | A-Frame WebXR scenes: Classroom, Auditorium, Lounge |
| 📹 **Live Video/Audio** | WebRTC mesh P2P, up to ~4 peers |
| 💬 **Real-Time Chat** | Socket.IO messages + emoji reactions |
| 🖥️ **Screen Sharing** | WebRTC track replacement |
| 🔑 **Join by Code** | 8-character unique room codes |
| 🔐 **JWT Auth** | Secure email/password authentication |
| 🌐 **VR Headset Support** | WebXR via A-Frame "Enter VR" button |
| 🎨 **Premium UI** | Framer Motion interactions, deep dark mode, and true glassmorphism |

---

## 🛠️ Tech Stack

```
Frontend:  React 18 + Vite, A-Frame 1.5, Socket.IO-client, Framer-Motion
Backend:   Node.js, Express, Socket.IO, Mongoose
Database:  MongoDB (In-memory for dev, MongoDB Atlas for production)
Auth:      JWT + bcryptjs
Video:     WebRTC (browser native)
3D/VR:     A-Frame 1.5 via CDN (WebXR)
```

---

## 🚀 How to Download & Run Locally

Follow these steps to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- Git

### 1. Clone the Repository

Download the project to your local machine using git:

```bash
git clone https://github.com/SaurabhForge/VRSphere.git
cd VRSphere
```

### 2. Install Dependencies

You need to install dependencies for both the backend server and the frontend client.

```bash
# Install server dependencies
cd server
npm install

# Return to root and install client dependencies
cd ../client
npm install
cd ..
```

### 3. Configure Environment Variables

The project comes with a default `.env` configuration in the `server` directory. If you don't have MongoDB installed locally, the server will automatically fall back to an **in-memory database** for development!

For production or persistent data, edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vr-events   # Or use a MongoDB Atlas URI
JWT_SECRET=your_super_secret_jwt_key_change_in_production
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 4. Start the Application

You need to run two terminal windows to start both the backend and frontend servers.

**Terminal 1 — Start the Backend Server:**
```bash
cd server
npm run dev
```
*(The server will run on `http://localhost:5000`)*

**Terminal 2 — Start the Frontend Client:**
```bash
cd client
npm run dev
```
*(The client will run on `http://localhost:5173`)*

### 5. Access the Platform
Open your browser and navigate to [http://localhost:5173](http://localhost:5173). You can create an account, create a new event, and enter the VR room!

---

## 🌐 Architecture

```
Browser (React + A-Frame)
        │
        ├── REST API ──────────► Express/Node.js ──► MongoDB
        │                               │
        ├── Socket.IO ─────────────────►│ (chat, signaling, presence)
        │                               │
        └── WebRTC P2P ◄──────────────── (offer/answer/ICE via socket)
```

---

## 🥽 VR Headset Support

The A-Frame scene includes a built-in **"Enter VR"** button. For full VR headset support:
- Run on **HTTPS** (required by WebXR).
- Use [ngrok](https://ngrok.com) for local dev: `ngrok http 5173`.
- Visit the HTTPS URL on your headset browser (Meta Quest, etc.).

---

*Built with MERN · A-Frame · WebRTC · Socket.IO · Framer Motion*
