import Message from "../models/Message.js";

// Helper to construct a single deterministic room ID for any pair of users
const getDirectRoomId = (userA, userB) => {
  return [String(userA), String(userB)].sort().join("_");
};

/**
 * Initializes all real-time Socket.io handlers for chat and messaging
 * @param {import("socket.io").Server} io
 */
export const initChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`⚡ New client connected: ${socket.id}`);

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
          "fullName role"
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
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};

export default initChatSocket;
