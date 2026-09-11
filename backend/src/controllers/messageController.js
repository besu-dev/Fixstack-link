import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Job from "../models/Job.js";

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

// @desc    Get all distinct conversations for authenticated user
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const currentUserId = new mongoose.Types.ObjectId(req.user._id);

    // 1. Find all messages involving the user, grouped by conversation partner
    const messageConversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: currentUserId }, { receiver: currentUserId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", currentUserId] },
              "$receiver",
              "$sender",
            ],
          },
          lastMessage: { $first: "$text" },
          lastMessageTime: { $first: "$createdAt" },
          jobId: { $first: "$job" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiver", currentUserId] },
                    { $eq: ["$read", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const conversationMap = new Map();

    for (const conv of messageConversations) {
      if (conv._id && mongoose.Types.ObjectId.isValid(conv._id)) {
        conversationMap.set(conv._id.toString(), {
          partnerId: conv._id,
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
          jobId: conv.jobId || null,
          unreadCount: conv.unreadCount || 0,
        });
      }
    }

    // 2. Also check assigned jobs so assigned contacts appear even before first message
    const assignedJobs = await Job.find({
      $or: [
        { customer: currentUserId, assignedProvider: { $ne: null } },
        { assignedProvider: currentUserId },
      ],
    })
      .populate(
        "customer",
        "fullName phone profession avatarUrl role subcity rating isVerified"
      )
      .populate(
        "assignedProvider",
        "fullName phone profession avatarUrl role subcity rating isVerified"
      );

    for (const job of assignedJobs) {
      const isCustomer =
        job.customer?._id?.toString() === currentUserId.toString();
      const partner = isCustomer ? job.assignedProvider : job.customer;

      if (partner && partner._id) {
        const pIdStr = partner._id.toString();
        if (!conversationMap.has(pIdStr)) {
          conversationMap.set(pIdStr, {
            partnerId: partner._id,
            lastMessage: "Tap to open chat history",
            lastMessageTime: job.updatedAt || job.createdAt,
            jobId: job._id,
            unreadCount: 0,
            participant: partner,
            jobTitle: job.title,
            subcity: job.subcity,
          });
        } else {
          const existing = conversationMap.get(pIdStr);
          if (!existing.jobId) existing.jobId = job._id;
          if (!existing.jobTitle) existing.jobTitle = job.title;
          if (!existing.subcity) existing.subcity = job.subcity;
        }
      }
    }

    // 3. Fetch user details for any conversations from Message that don't have participant populated yet
    const missingUserIds = [];
    for (const [pId, conv] of conversationMap.entries()) {
      if (!conv.participant) {
        missingUserIds.push(conv.partnerId);
      }
    }

    if (missingUserIds.length > 0) {
      const users = await User.find({ _id: { $in: missingUserIds } }).select(
        "fullName phone profession avatarUrl role subcity rating isVerified"
      );
      const uMap = new Map();
      users.forEach((u) => uMap.set(u._id.toString(), u));

      for (const [pId, conv] of conversationMap.entries()) {
        if (!conv.participant && uMap.has(pId)) {
          conv.participant = uMap.get(pId);
        }
      }
    }

    // 4. Fetch job details for any conversations with jobId but missing jobTitle
    const missingJobIds = [];
    for (const conv of conversationMap.values()) {
      if (conv.jobId && !conv.jobTitle) {
        missingJobIds.push(conv.jobId);
      }
    }

    if (missingJobIds.length > 0) {
      const jobs = await Job.find({ _id: { $in: missingJobIds } }).select(
        "title subcity"
      );
      const jMap = new Map();
      jobs.forEach((j) => jMap.set(j._id.toString(), j));

      for (const conv of conversationMap.values()) {
        if (conv.jobId && !conv.jobTitle && jMap.has(conv.jobId.toString())) {
          const j = jMap.get(conv.jobId.toString());
          conv.jobTitle = j.title;
          conv.subcity = conv.subcity || j.subcity;
        }
      }
    }

    // 5. Build output format with aliases so both seeker and provider screens work seamlessly
    const result = Array.from(conversationMap.values())
      .filter((c) => Boolean(c.participant))
      .map((c) => ({
        partnerId: c.participant._id.toString(),
        providerId: c.participant._id.toString(),
        clientId: c.participant._id.toString(),
        jobId: c.jobId ? c.jobId.toString() : "",
        participant: c.participant,
        provider: c.participant,
        client: c.participant,
        jobTitle: c.jobTitle || c.participant.profession || "General Chat",
        subcity: c.subcity || c.participant.subcity || "Addis Ababa",
        lastMessage: c.lastMessage || "Tap to open chat history",
        lastMessageTime: c.lastMessageTime || new Date().toISOString(),
        unreadCount: c.unreadCount || 0,
      }))
      .sort(
        (a, b) =>
          new Date(b.lastMessageTime).getTime() -
          new Date(a.lastMessageTime).getTime()
      );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in getConversations:", error);
    return res.status(500).json({ message: error.message });
  }
};

