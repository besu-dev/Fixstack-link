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
      .populate("sender", "fullName role")
      .sort({ createdAt: 1 });

    return res.status(200).json(messages);
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

    const newMessage = await Message.create({
      job: jobId || undefined,
      sender: req.user._id,
      receiver: receiverId || undefined,
      text: text.trim(),
    });

    const populated = await newMessage.populate("sender", "fullName role");
    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
