import express from "express";
import {
  buyConnects,
  getWalletStatus,
  initializeChapaPayment,
  verifyChapaPayment,
} from "../controllers/walletController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Existing wallet endpoints
router.get("/balance", protect, getWalletStatus);
router.post("/buy-connects", protect, buyConnects);

// Chapa payment integration endpoints
router.post("/chapa/initialize", protect, initializeChapaPayment);
router.get("/chapa/verify/:tx_ref", protect, verifyChapaPayment);

export default router;
