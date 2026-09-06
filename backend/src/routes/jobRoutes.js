import express from "express";
import {
  createJob,
  getJobs,
  getJobById,
  getMyJobs,
  getProviderTasks,
  markJobCompleted,
  reviewJob,
} from "../controllers/jobController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Specific routes first
router.get("/my-jobs", protect, getMyJobs);
router.get("/provider-tasks", protect, getProviderTasks);
router.patch("/:id/complete", protect, markJobCompleted);

// Match both /rate-review and /review to prevent mismatch errors
router.post("/:id/rate-review", protect, reviewJob);
router.post("/:id/review", protect, reviewJob);

// Root routes
router
  .route("/")
  .post(protect, upload.array("photos", 4), createJob)
  .get(protect, getJobs);

// Dynamic parameter routes last
router.route("/:id").get(protect, getJobById);

export default router;
