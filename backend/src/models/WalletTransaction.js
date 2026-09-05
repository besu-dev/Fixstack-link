import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "connects_purchase",
        "job_post_deduction",
        "bid_deduction",
        "proposal_boost",
        "featured_subscription",
      ],
      required: true,
    },
    amountETB: {
      type: Number,
      default: 0,
    },
    connects: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["telebirr", "cbebirr", "chapa", "wallet_deduction"],
      default: "wallet_deduction",
    },
    referenceTxId: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
  },
  { timestamps: true },
);

export default mongoose.model("WalletTransaction", walletTransactionSchema);
