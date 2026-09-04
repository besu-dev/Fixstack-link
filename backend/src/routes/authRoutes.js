import express from "express";
import { register, login } from "../controllers/authController.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Allow optional file uploads for provider registration (kebeleId and tradeCert)
router.post(
  "/register",
  upload.fields([
    { name: "kebeleId", maxCount: 1 },
    { name: "tradeCert", maxCount: 1 },
  ]),
  register,
);

router.post("/login", login);

export default router;
