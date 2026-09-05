import mongoose from "mongoose";

const bidSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: {
      type: Number,
      required: true, // Technician base quote in ETB
    },
    serviceFee: {
      type: Number,
      default: 0, // e.g., 5% platform fee
    },
    totalAmount: {
      type: Number,
      default: function () {
        return this.price + (this.serviceFee || 0);
      },
    },
    estimatedDuration: {
      type: String,
      default: "2-3 hours",
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    // --- Connects & Promotion Additions ---
    connectsSpent: {
      type: Number,
      required: true,
      default: 2, // Base application deduction (2 to 4 connects)
    },
    isBoosted: {
      type: Boolean,
      default: false, // True if technician bid extra connects to appear #1
    },
    boostConnectsSpent: {
      type: Number,
      default: 0, // Extra connects burned for priority placement (e.g., +5)
    },
  },
  { timestamps: true },
);

// Compound index to quickly fetch and rank boosted bids at the top for customer reviews
bidSchema.index({ job: 1, isBoosted: -1, createdAt: 1 });

export default mongoose.model("Bid", bidSchema);
