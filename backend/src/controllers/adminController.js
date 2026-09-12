import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Bid from "../models/Bid.js";
import WalletTransaction from "../models/WalletTransaction.js";
import Notification from "../models/Notification.js";
import { generateToken } from "../config/jwt.js";

/**
 * Admin Login
 * POST /api/admin/login
 */
export const adminLogin = async (req, res) => {
  try {
    const { identifier, email, phone, password } = req.body;
    const loginKey = (identifier || email || phone || "").trim();

    if (!loginKey || !password) {
      return res.status(400).json({ message: "Please provide admin email and password" });
    }

    // Find user by email or phone
    const user = await User.findOne({
      $or: [
        { email: loginKey.toLowerCase() },
        { phone: loginKey },
      ],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid administrator credentials" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. You do not have administrator permissions." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid administrator credentials" });
    }

    const token = generateToken(user._id, "admin");

    return res.status(200).json({
      token,
      admin: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl || "",
      },
    });
  } catch (error) {
    console.error("--> [Admin Login Error]:", error);
    return res.status(500).json({ message: error.message || "Admin login error" });
  }
};

/**
 * Get Platform Dashboard Analytics & Statistics
 * GET /api/admin/stats
 */
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalProviders,
      pendingVerifications,
      verifiedProviders,
      totalJobs,
      openJobs,
      assignedJobs,
      completedJobs,
      cancelledJobs,
      totalBids,
      categoryStats,
      subcityStats,
      recentUsers,
      recentJobs,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: "admin" } }),
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "provider" }),
      User.countDocuments({ role: "provider", isVerified: false }),
      User.countDocuments({ role: "provider", isVerified: true }),
      Job.countDocuments(),
      Job.countDocuments({ status: "open" }),
      Job.countDocuments({ status: "assigned" }),
      Job.countDocuments({ status: "completed" }),
      Job.countDocuments({ status: "cancelled" }),
      Bid.countDocuments(),
      // Group jobs by category
      Job.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      // Group providers by subcity
      User.aggregate([
        { $match: { role: "provider" } },
        { $group: { _id: "$subcity", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      // Recent user signups
      User.find({ role: { $ne: "admin" } })
        .sort({ createdAt: -1 })
        .limit(6)
        .select("fullName role profession subcity isVerified createdAt avatarUrl"),
      // Recent jobs posted
      Job.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate("customer", "fullName phone avatarUrl")
        .select("title category budget urgency status createdAt customer"),
    ]);

    // Calculate total job budget volume
    const budgetAggregate = await Job.aggregate([
      { $group: { _id: null, totalBudget: { $sum: "$budget" } } },
    ]);
    const totalVolume = budgetAggregate.length > 0 ? budgetAggregate[0].totalBudget : 0;

    return res.status(200).json({
      users: {
        total: totalUsers,
        customers: totalCustomers,
        providers: totalProviders,
        pendingVerifications,
        verifiedProviders,
      },
      jobs: {
        total: totalJobs,
        open: openJobs,
        assigned: assignedJobs,
        completed: completedJobs,
        cancelled: cancelledJobs,
        totalVolumeETB: totalVolume,
      },
      bids: {
        total: totalBids,
      },
      breakdowns: {
        byCategory: categoryStats.map((c) => ({ category: c._id || "Other", count: c.count })),
        bySubcity: subcityStats.map((s) => ({ subcity: s._id || "Unspecified", count: s.count })),
      },
      recentActivity: {
        users: recentUsers,
        jobs: recentJobs,
      },
    });
  } catch (error) {
    console.error("--> [Admin Stats Error]:", error);
    return res.status(500).json({ message: error.message || "Failed to fetch admin stats" });
  }
};

/**
 * Get All Users with Filtering & Pagination
 * GET /api/admin/users
 */
export const getUsers = async (req, res) => {
  try {
    const { role, isVerified, search, subcity, page = 1, limit = 20 } = req.query;

    const query = {};

    if (role && role !== "all" && role !== "undefined" && role !== "null") {
      query.role = role;
    }

    if (isVerified !== undefined && isVerified !== "all" && isVerified !== "undefined" && isVerified !== "null") {
      query.isVerified = isVerified === "true";
    }

    if (subcity && subcity !== "all" && subcity !== "All" && subcity !== "undefined" && subcity !== "null") {
      query.subcity = subcity;
    }

    if (search && search.trim() && search.trim() !== "undefined" && search.trim() !== "null") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { profession: searchRegex },
        { subcity: searchRegex },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .select("-password");

    return res.status(200).json({
      users,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    console.error("--> [Admin Get Users Error]:", error);
    return res.status(500).json({ message: error.message || "Failed to fetch users" });
  }
};

/**
 * Get User Details by ID
 * GET /api/admin/users/:id
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let userJobs = [];
    let userBids = [];

    if (user.role === "customer") {
      userJobs = await Job.find({ customer: user._id })
        .sort({ createdAt: -1 })
        .limit(10);
    } else if (user.role === "provider") {
      userBids = await Bid.find({ provider: user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("job", "title category status budget");
    }

    return res.status(200).json({
      user,
      recentJobs: userJobs,
      recentBids: userBids,
    });
  } catch (error) {
    console.error("--> [Admin Get User Details Error]:", error);
    return res.status(500).json({ message: error.message || "Failed to fetch user details" });
  }
};

/**
 * Update User Info (Connects, Verification, Role, Status)
 * PUT /api/admin/users/:id
 */
export const updateUser = async (req, res) => {
  try {
    const { connectsBalance, isVerified, isFeatured, accountStatus, role, fullName, profession, subcity } = req.body;

    const updates = {};
    if (connectsBalance !== undefined) updates.connectsBalance = Number(connectsBalance);
    if (isVerified !== undefined) updates.isVerified = Boolean(isVerified);
    if (isFeatured !== undefined) {
      updates.isFeatured = Boolean(isFeatured);
      updates.featuredUntil = Boolean(isFeatured) ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null;
    }
    if (accountStatus) updates.accountStatus = accountStatus;
    if (role) updates.role = role;
    if (fullName) updates.fullName = fullName.trim();
    if (profession !== undefined) updates.profession = profession;
    if (subcity) updates.subcity = subcity;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("--> [Admin Update User Error]:", error);
    return res.status(500).json({ message: error.message || "Failed to update user" });
  }
};

/**
 * Delete User
 * DELETE /api/admin/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot delete master administrator account" });
    }

    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("--> [Admin Delete User Error]:", error);
    return res.status(500).json({ message: error.message || "Failed to delete user" });
  }
};

/**
 * Get Pending Technician Verification Queue
 * GET /api/admin/verifications
 */
export const getPendingVerifications = async (req, res) => {
  try {
    const { status = "pending" } = req.query;

    const query = { role: "provider" };
    if (status === "pending") {
      query.isVerified = false;
      query.rejectionReason = { $in: ["", null] };
    } else if (status === "verified") {
      query.isVerified = true;
    } else if (status === "rejected") {
      query.isVerified = false;
      query.rejectionReason = { $nin: ["", null] };
    }

    const providers = await User.find(query)
      .sort({ createdAt: -1 })
      .select("fullName email phone profession subcity experience skills kebeleIdUrl tradeCertUrl avatarUrl isVerified rejectionReason connectsBalance createdAt");

    return res.status(200).json({ providers });
  } catch (error) {
    console.error("--> [Admin Verifications Error]:", error);
    return res.status(500).json({ message: error.message || "Failed to fetch verification queue" });
  }
};

/**
 * Verify or Reject Technician Credentials
 * PUT /api/admin/verify-provider/:id
 */
export const verifyProvider = async (req, res) => {
  try {
    const { isVerified, rejectionReason, bonusConnects = 10 } = req.body;
    const provider = await User.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ message: "Technician not found" });
    }

    const updates = {
      isVerified: Boolean(isVerified),
      rejectionReason: Boolean(isVerified) ? "" : (rejectionReason || "Documents could not be verified. Please resubmit."),
    };

    // If approving, grant welcome bonus connects
    if (Boolean(isVerified) && !provider.isVerified) {
      updates.connectsBalance = (provider.connectsBalance || 0) + Number(bonusConnects);
    }

    const updatedProvider = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).select("-password");

    // Send system notification
    try {
      await Notification.create({
        user: provider._id,
        title: Boolean(isVerified) ? "Account Verified!" : "Verification Update",
        message: Boolean(isVerified)
          ? `Congratulations! Your professional credentials have been approved by Bete Admin. You have received ${bonusConnects} bonus connects to start bidding on jobs!`
          : `Your verification request was not approved: ${updates.rejectionReason}`,
        type: "system",
      });
    } catch (notifErr) {
      console.warn("Could not save verification notification:", notifErr.message);
    }

    return res.status(200).json({
      message: Boolean(isVerified) ? "Technician approved and verified successfully" : "Technician verification rejected",
      provider: updatedProvider,
    });
  } catch (error) {
    console.error("--> [Admin Verify Provider Error]:", error);
    return res.status(500).json({ message: error.message || "Failed to verify technician" });
  }
};

/**
 * Toggle Featured Provider Badge
 * PUT /api/admin/feature-provider/:id
 */
export const toggleFeaturedProvider = async (req, res) => {
  try {
    const provider = await User.findById(req.params.id);
    if (!provider || provider.role !== "provider") {
      return res.status(404).json({ message: "Technician not found" });
    }

    const newFeatured = !provider.isFeatured;
    const featuredUntil = newFeatured ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isFeatured: newFeatured, featuredUntil } },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      message: `Technician is now ${newFeatured ? "featured" : "unfeatured"}`,
      provider: updated,
    });
  } catch (error) {
    console.error("--> [Admin Feature Provider Error]:", error);
    return res.status(500).json({ message: error.message || "Failed to toggle featured status" });
  }
};

/**
 * Get All Jobs Across Platform
 * GET /api/admin/jobs
 */
export const getJobs = async (req, res) => {
  try {
    const { status, category, urgency, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status && status !== "all" && status !== "undefined" && status !== "null") query.status = status;
    if (category && category !== "all" && category !== "undefined" && category !== "null") query.category = category;
    if (urgency && urgency !== "all" && urgency !== "undefined" && urgency !== "null") query.urgency = urgency;

    if (search && search.trim() && search.trim() !== "undefined" && search.trim() !== "null") {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: regex },
        { description: regex },
        { specificLocation: regex },
        { subcity: regex },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate("customer", "fullName phone email avatarUrl")
      .populate("assignedProvider", "fullName phone email avatarUrl profession rating");

    return res.status(200).json({
      jobs,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    console.error("--> [Admin Get Jobs Error]:", error);
    return res.status(500).json({ message: error.message || "Failed to fetch jobs" });
  }
};

/**
 * Get Single Job Details with Placed Bids
 * GET /api/admin/jobs/:id
 */
export const getJobDetails = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("customer", "fullName phone email avatarUrl subcity")
      .populate("assignedProvider", "fullName phone email avatarUrl profession rating");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const bids = await Bid.find({ job: job._id })
      .sort({ isBoosted: -1, createdAt: 1 })
      .populate("provider", "fullName phone profession avatarUrl rating isVerified");

    return res.status(200).json({ job, bids });
  } catch (error) {
    console.error("--> [Admin Job Details Error]:", error);
    return res.status(500).json({ message: error.message || "Failed to fetch job details" });
  }
};

/**
 * Override / Update Job Status (Admin Resolution)
 * PUT /api/admin/jobs/:id/status
 */
export const updateJobStatus = async (req, res) => {
  try {
    const { status, assignedProviderId } = req.body;
    const updates = {};

    if (status) updates.status = status;
    if (assignedProviderId !== undefined) {
      updates.assignedProvider = assignedProviderId || null;
      if (assignedProviderId) updates.status = "assigned";
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    )
      .populate("customer", "fullName phone")
      .populate("assignedProvider", "fullName phone");

    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json({
      message: "Job status updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    console.error("--> [Admin Update Job Status Error]:", error);
    return res.status(500).json({ message: error.message || "Failed to update job status" });
  }
};

/**
 * Get All Bids Across Platform
 * GET /api/admin/bids
 */
export const getBids = async (req, res) => {
  try {
    const { status, page = 1, limit = 25 } = req.query;
    const query = {};
    if (status && status !== "all") query.status = status;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Bid.countDocuments(query);
    const bids = await Bid.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate("provider", "fullName phone profession avatarUrl rating isVerified")
      .populate("job", "title category budget status subcity");

    return res.status(200).json({
      bids,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    console.error("--> [Admin Get Bids Error]:", error);
    return res.status(500).json({ message: error.message || "Failed to fetch bids" });
  }
};

/**
 * Get All Wallet Transactions Across Platform
 * GET /api/admin/transactions
 */
export const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 25 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await WalletTransaction.countDocuments();
    const transactions = await WalletTransaction.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate("user", "fullName phone role email");

    return res.status(200).json({
      transactions,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    console.error("--> [Admin Get Transactions Error]:", error);
    return res.status(500).json({ message: error.message || "Failed to fetch transactions" });
  }
};

/**
 * Seed Default Administrator Account If None Exists
 * Helper called at server bootstrap
 */
export const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: "admin" });
    if (!adminExists) {
      console.log("--> [Admin Seed]: No administrator found. Initializing default admin account...");
      const hashedPassword = await bcrypt.hash("Admin@123456", 10);
      const newAdmin = await User.create({
        fullName: "Bete Administrator",
        email: "admin@bete.et",
        phone: "+251911000000",
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        accountStatus: "active",
        subcity: "Kirkos",
      });
      console.log(`--> [Admin Seed]: Default admin created: ${newAdmin.email} (Password: Admin@123456)`);
    } else {
      console.log(`--> [Admin Seed]: Administrator account already active (${adminExists.email})`);
    }
  } catch (error) {
    console.error("--> [Admin Seed Error]:", error.message);
  }
};
