import express from "express";
import {
  getMessagesByJob,
  sendMessage,
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:jobId", protect, getMessagesByJob);
router.post("/", protect, sendMessage);

export default router;
