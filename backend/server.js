import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import jobRoutes from "./src/routes/jobRoutes.js";
import bidRoutes from "./src/routes/bidRoutes.js";
import messageRoutes from "./src/routes/messageRoutes.js";
import walletRoutes from "./src/routes/walletRoutes.js"; 
import notificationRoutes from "./src/routes/notificationRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import { seedAdmin } from "./src/controllers/adminController.js";
import { initChatSocket } from "./src/sockets/chatSocket.js";

dotenv.config();

// Resolve ES module paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB().then(() => {
  seedAdmin();
});

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Expose io instance to Express request handlers
app.set("io", io);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded documents statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/users", authRoutes); // User & provider endpoint alias
app.use("/api/jobs", jobRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/wallet", walletRoutes); // 2. Mount wallet endpoints
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "FixLink API running smoothly" });
});

// Global error handling middleware (handles Multer errors, validation errors, etc.)
app.use((err, req, res, next) => {
  console.error("--> [FixLink Server Error]:", err.message || err);
  if (err.name === "MulterError" || err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  res.status(err.status || 500).json({
    message: err.message || "An unexpected server error occurred",
  });
});

// Initialize Real-Time Socket.io Handlers
initChatSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
