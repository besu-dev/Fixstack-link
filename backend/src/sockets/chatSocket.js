import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { sendExpoPushNotification } from "../utils/pushNotification.js";

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

    // Register personal user room for direct job alerts and notifications
    socket.on("register_user", (userId) => {
      if (userId) {
        const userRoom = `user_${userId}`;
        socket.join(userRoom);
        console.log(`Socket ${socket.id} joined personal alert room: ${userRoom}`);
      }
    });

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
        const validJobId =
          jobId && mongoose.Types.ObjectId.isValid(jobId) ? jobId : undefined;

        const newMessage = await Message.create({
          job: validJobId,
          sender: senderId,
          receiver: receiverId,
          text: text.trim(),
          read: false,
        });

        const populatedMessage = await newMessage.populate(
          "sender",
          "fullName role avatarUrl"
        );

        // Emit to direct pair room if receiverId exists
        if (receiverId) {
          const directRoom = getDirectRoomId(senderId, receiverId);
          io.to(directRoom).emit("receive_message", populatedMessage);

          // Also emit to receiver's personal user room for badge / notifications
          io.to(`user_${receiverId}`).emit(
            "new_message_notification",
            populatedMessage
          );

          // Send Push Notification to recipient
          try {
            const receiverUser = await User.findById(receiverId).select("pushToken notificationsEnabled");
            if (receiverUser?.pushToken && receiverUser.notificationsEnabled !== false) {
              sendExpoPushNotification({
                to: receiverUser.pushToken,
                title: populatedMessage.sender?.fullName || "New Message 💬",
                body: populatedMessage.text,
                data: {
                  type: "chat_message",
                  senderId: String(senderId),
                  receiverId: String(receiverId),
                  jobId: validJobId ? String(validJobId) : "",
                },
              }).catch((pushErr) => console.error("Chat push error:", pushErr));
            }
          } catch (pushLookupErr) {
            console.error("Chat push user lookup error:", pushLookupErr);
          }
        }

        // Also emit to the jobId room if provided
        if (jobId) {
          io.to(String(jobId)).emit("receive_message", populatedMessage);
        }
      } catch (error) {
        console.error("Socket error on send_message:", error.message);
      }
    });

    // 3. Mark conversation messages as read
    socket.on("mark_conversation_read", async ({ readerId, senderId }) => {
      try {
        if (readerId && senderId) {
          await Message.updateMany(
            { receiver: readerId, sender: senderId, read: false },
            { read: true }
          );
          io.to(`user_${readerId}`).emit("messages_marked_read", { senderId });
          io.to(`user_${senderId}`).emit("messages_marked_read", { readerId });
        }
      } catch (err) {
        console.error("Socket error on mark_conversation_read:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};

export default initChatSocket;
