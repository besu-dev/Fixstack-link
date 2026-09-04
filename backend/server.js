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
import Message from "./src/models/Message.js";

dotenv.config();

// Resolve ES module paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded documents statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/messages", messageRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "FixLink API running smoothly" });
});

// Helper to construct a single deterministic room ID for any pair of users
const getDirectRoomId = (userA, userB) => {
  return [String(userA), String(userB)].sort().join("_");
};

// Real-Time Socket.io Connection
io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // 1. Join user-to-user direct conversation room
  socket.on("join_chat_room", ({ userId1, userId2, jobId }) => {
    if (userId1 && userId2) {
      const directRoom = getDirectRoomId(userId1, userId2);
      socket.join(directRoom);
      console.log(`Socket ${socket.id} joined direct user room: ${directRoom}`);
    }
    if (jobId) {
      socket.join(String(jobId));
      console.log(`Socket ${socket.id} joined job room: ${jobId}`);
    }
  });

  // Fallback for legacy job room listener
  socket.on("join_job_room", (jobId) => {
    if (jobId) {
      socket.join(String(jobId));
      console.log(`Socket ${socket.id} joined room: ${jobId}`);
    }
  });

  // 2. Handle incoming chat messages
  socket.on("send_message", async (data) => {
    try {
      const { jobId, senderId, receiverId, text } = data;

      if (!senderId || !text) return;

      // Save to database
      const newMessage = await Message.create({
        job: jobId,
        sender: senderId,
        receiver: receiverId,
        text: text.trim(),
      });

      const populatedMessage = await newMessage.populate(
        "sender",
        "fullName role",
      );

      // Emit to direct pair room if receiverId exists
      if (receiverId) {
        const directRoom = getDirectRoomId(senderId, receiverId);
        io.to(directRoom).emit("receive_message", populatedMessage);
      }

      // Also emit to the jobId room if provided
      if (jobId) {
        io.to(String(jobId)).emit("receive_message", populatedMessage);
      }
    } catch (error) {
      console.error("Socket error on send_message:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
