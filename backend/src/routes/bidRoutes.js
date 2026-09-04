import express from "express";
import {
  placeBid,
  getBidsForJob,
  acceptBid,
} from "../controllers/bidController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, placeBid);
router.get("/job/:jobId", protect, getBidsForJob);
router.patch("/:bidId/accept", protect, acceptBid);

export default router;
