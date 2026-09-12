import express from "express";
import {
  adminLogin,
  getDashboardStats,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getPendingVerifications,
  verifyProvider,
  toggleFeaturedProvider,
  getJobs,
  getJobDetails,
  updateJobStatus,
  getBids,
  getTransactions,
  seedAdmin,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public Admin Authentication
router.post("/login", adminLogin);

// Bootstrap seed endpoint (safe: only creates if no admin exists)
router.post("/seed", async (req, res) => {
  await seedAdmin();
  res.status(200).json({ message: "Admin seed check executed" });
});

// All following routes require a valid JWT token AND admin role
router.use(protect, adminOnly);

// Platform Analytics & Metrics
router.get("/stats", getDashboardStats);

// User Management
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Technician Credential Verification & Badging
router.get("/verifications", getPendingVerifications);
router.put("/verify-provider/:id", verifyProvider);
router.put("/feature-provider/:id", toggleFeaturedProvider);

// Service Requests / Jobs Oversight
router.get("/jobs", getJobs);
router.get("/jobs/:id", getJobDetails);
router.put("/jobs/:id/status", updateJobStatus);

// Bids & Wallet Oversight
router.get("/bids", getBids);
router.get("/transactions", getTransactions);

export default router;
