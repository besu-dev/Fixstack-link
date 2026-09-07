import express from "express";
import {
  register,
  login,
  getProviders,
  getProviderById,
  getMe,
  updateProfile,
  deleteAvatar,
} from "../controllers/authController.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// Allow optional file uploads for registration (kebeleId, tradeCert, and profile avatar)
router.post(
  "/register",
  upload.fields([
    { name: "kebeleId", maxCount: 1 },
    { name: "tradeCert", maxCount: 1 },
    { name: "avatar", maxCount: 1 },
  ]),
  register,
);

router.post("/login", login);

// Public provider directory endpoint (with featured sorting)
router.get("/providers", getProviders);

// Fetch public profile details of a specific technician
router.get("/provider/:id", getProviderById);

// Authenticated user profile routes
router.get("/me", protect, getMe);

// Profile edit route (supports multipart text fields and avatar photo update)
router.put("/profile", protect, upload.single("avatar"), updateProfile);

// Remove user avatar route
router.delete("/avatar", protect, deleteAvatar);

// Toggle technician availability on/off duty
router.put("/availability", protect, async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { isAvailable: Boolean(isAvailable) } },
      { new: true },
    ).select("-password");

    res.status(200).json({
      message: `Status changed to ${user.isAvailable ? "Available" : "Offline"}`,
      isAvailable: user.isAvailable,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
