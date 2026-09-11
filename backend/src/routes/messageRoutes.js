import express from "express";
import {
  getMessagesByJob,
  sendMessage,
  getUnreadCount,
  markConversationAsRead,
  getConversations,
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/conversations", getConversations);
router.get("/unread-count", getUnreadCount);
router.patch("/read/:senderId", markConversationAsRead);
router.get("/:jobId", getMessagesByJob);
router.post("/", sendMessage);

export default router;
