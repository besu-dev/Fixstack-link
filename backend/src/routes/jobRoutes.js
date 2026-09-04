import express from "express";
import {
  createJob,
  getJobs,
  getJobById,
  getMyJobs,
  getProviderTasks, // 1. Import
  markJobCompleted,
  reviewJob,
} from "../controllers/jobController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Specific routes first
router.get("/my-jobs", protect, getMyJobs);
router.get("/provider-tasks", protect, getProviderTasks); // 2. Mount before /:id
router.patch("/:id/complete", protect, markJobCompleted);
router.post("/:id/review", protect, reviewJob);

// Root routes
router
  .route("/")
  .post(protect, upload.array("photos", 4), createJob)
  .get(protect, getJobs);

// Dynamic parameter routes last
router.route("/:id").get(protect, getJobById);

export default router;
