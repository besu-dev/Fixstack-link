import mongoose from "mongoose";
import Message from "../models/Message.js";

// @desc    Get complete chat history between two users (or by job)
// @route   GET /api/messages/:jobId
// @access  Private
export const getMessagesByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { receiverId } = req.query;

    let query = {};

    if (receiverId && mongoose.Types.ObjectId.isValid(receiverId)) {
      // Fetch all messages exchanged between these two people across any job
      query = {
        $or: [
          { sender: req.user._id, receiver: receiverId },
          { sender: receiverId, receiver: req.user._id },
        ],
      };
    } else if (jobId && mongoose.Types.ObjectId.isValid(jobId)) {
      // Fallback to jobId if receiverId isn't passed
      query = { job: jobId };
    } else {
      return res.status(200).json([]);
    }

    const messages = await Message.find(query)
      .populate("sender", "fullName role avatarUrl")
      .sort({ createdAt: 1 });

    // Mark messages received by the current user in this chat as read
    if (receiverId && mongoose.Types.ObjectId.isValid(receiverId)) {
      await Message.updateMany(
        { receiver: req.user._id, sender: receiverId, read: false },
        { read: true },
      );
    } else if (jobId && mongoose.Types.ObjectId.isValid(jobId)) {
      await Message.updateMany(
        { receiver: req.user._id, job: jobId, read: false },
        { read: true },
      );
    }

    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get total count of unread messages for authenticated user
// @route   GET /api/messages/unread-count
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      read: false,
    });
    return res.status(200).json({ unreadCount: count });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all messages from a specific sender as read
// @route   PATCH /api/messages/read/:senderId
// @access  Private
export const markConversationAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;
    await Message.updateMany(
      {
        receiver: req.user._id,
        sender: senderId,
        read: false,
      },
      { read: true },
    );
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Post message via REST fallback
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { jobId, receiverId, text } = req.body;

    if (!text || !text.trim()) {
      return res
        .status(400)
        .json({ message: "Message content cannot be blank" });
    }

    const validJobId =
      jobId && mongoose.Types.ObjectId.isValid(jobId) ? jobId : undefined;
    const validReceiverId =
      receiverId && mongoose.Types.ObjectId.isValid(receiverId)
        ? receiverId
        : undefined;

    const newMessage = await Message.create({
      job: validJobId,
      sender: req.user._id,
      receiver: validReceiverId,
      text: text.trim(),
      read: false,
    });

    const populated = await newMessage.populate("sender", "fullName role avatarUrl");
    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
