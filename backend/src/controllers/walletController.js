import axios from "axios";
import User from "../models/User.js";
import WalletTransaction from "../models/WalletTransaction.js";

// Package rates matching your schema
const PACKAGES = {
  basic: { priceETB: 50, connects: 10 },
  standard: { priceETB: 100, connects: 25 },
  premium: { priceETB: 200, connects: 60 },
};

// @desc    Initialize Chapa Checkout URL
// @route   POST /api/wallet/chapa/initialize
// @access  Private
export const initializeChapaPayment = async (req, res) => {
  try {
    const { packageId } = req.body;
    const bundle = PACKAGES[packageId];

    if (!bundle) {
      return res.status(400).json({ message: "Invalid connects bundle" });
    }

    const tx_ref = `fixlink-tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create a pending transaction log in MongoDB
    await WalletTransaction.create({
      user: req.user._id,
      type: "connects_purchase",
      amountETB: bundle.priceETB,
      connects: bundle.connects,
      paymentMethod: "chapa",
      referenceTxId: tx_ref,
      status: "pending",
    });

    const user = await User.findById(req.user._id);

    // Fallbacks for names and email to satisfy Chapa requirements
    const nameParts = (user.fullName || "FixLink User").trim().split(" ");
    const firstName = nameParts[0] || "FixLink";
    const lastName = nameParts.slice(1).join(" ") || "User";
    const cleanPhone = (user.phone || "0911000000").replace("+251", "0");
    const userEmail =
      user.email || `${cleanPhone.replace(/[\s\-()]/g, "")}@fixlink.et`;

    const payload = {
      amount: bundle.priceETB.toString(),
      currency: "ETB",
      email: userEmail,
      first_name: firstName,
      last_name: lastName,
      phone_number: cleanPhone,
      tx_ref,
      return_url: "fixlink://payment-success",
      customization: {
        title: "FixLink Connects Top-Up",
        description: `Purchase ${bundle.connects} Connects Bundle`,
      },
    };

    const chapaRes = await axios.post(
      `${process.env.CHAPA_BASE_URL || "https://api.chapa.co/v1"}/transaction/initialize`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (chapaRes.data && chapaRes.data.status === "success") {
      return res.status(200).json({
        checkoutUrl: chapaRes.data.data.checkout_url,
        tx_ref,
      });
    }

    return res
      .status(400)
      .json({ message: "Unable to initiate payment with Chapa." });
  } catch (error) {
    console.error(
      "--> Chapa init error:",
      error.response?.data || error.message,
    );
    return res.status(500).json({
      message:
        error.response?.data?.message || "Failed to start payment process",
    });
  }
};

// @desc    Verify transaction with Chapa and credit Connects
// @route   GET /api/wallet/chapa/verify/:tx_ref
// @access  Private
export const verifyChapaPayment = async (req, res) => {
  try {
    const { tx_ref } = req.params;

    // Verify transaction status with Chapa servers
    const chapaRes = await axios.get(
      `${process.env.CHAPA_BASE_URL || "https://api.chapa.co/v1"}/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      },
    );

    if (chapaRes.data?.status !== "success") {
      return res
        .status(400)
        .json({ message: "Payment verification failed or not completed." });
    }

    const transaction = await WalletTransaction.findOne({
      referenceTxId: tx_ref,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction record not found." });
    }

    // Guard against duplicate balance additions
    if (transaction.status === "completed") {
      const user = await User.findById(transaction.user).select(
        "connectsBalance isFeatured",
      );
      return res.status(200).json({
        message: "Payment already credited.",
        connectsBalance: user.connectsBalance,
      });
    }

    // Mark transaction complete
    transaction.status = "completed";
    await transaction.save();

    // Credit Connects to user wallet
    const updatedUser = await User.findByIdAndUpdate(
      transaction.user,
      { $inc: { connectsBalance: transaction.connects } },
      { new: true },
    ).select("connectsBalance isFeatured");

    return res.status(200).json({
      message: `Successfully credited ${transaction.connects} Connects!`,
      connectsBalance: updatedUser.connectsBalance,
      transaction,
    });
  } catch (error) {
    console.error(
      "--> Chapa verify error:",
      error.response?.data || error.message,
    );
    return res.status(500).json({
      message:
        error.response?.data?.message ||
        "Verification request encountered an error",
    });
  }
};

// @desc    Manual / Simulation top-up for Telebirr / CBE
// @route   POST /api/wallet/buy-connects
// @access  Private
export const buyConnects = async (req, res) => {
  try {
    const { packageId, paymentMethod, paymentReference } = req.body;

    const bundle = PACKAGES[packageId];
    if (!bundle) {
      return res.status(400).json({ message: "Invalid connects bundle" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { connectsBalance: bundle.connects } },
      { new: true },
    );

    const transaction = await WalletTransaction.create({
      user: req.user._id,
      type: "connects_purchase",
      amountETB: bundle.priceETB,
      connects: bundle.connects,
      paymentMethod: paymentMethod || "telebirr",
      referenceTxId: paymentReference || `TX-${Date.now()}`,
      status: "completed",
    });

    return res.status(200).json({
      message: `Successfully added ${bundle.connects} Connects to your wallet!`,
      connectsBalance: updatedUser.connectsBalance,
      transaction,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get current wallet balance and history
// @route   GET /api/wallet/balance
// @access  Private
export const getWalletStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "connectsBalance isFeatured",
    );
    const history = await WalletTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({
      connectsBalance: user?.connectsBalance || 0,
      isFeatured: user?.isFeatured || false,
      history,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
