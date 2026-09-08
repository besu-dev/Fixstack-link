import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    type: {
      type: String,
      enum: ["new_job_alert", "new_proposal", "proposal_accepted", "general"],
      default: "new_job_alert",
    },
    serviceName: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: "Addis Ababa",
    },
    budget: {
      type: Number,
      default: 0,
    },
    urgency: {
      type: String,
      enum: ["Emergency", "Today", "Flexible"],
      default: "Today",
    },
    // Proposal-specific fields
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    providerName: {
      type: String,
      default: "",
    },
    proposalPrice: {
      type: Number,
      default: null,
    },
    proposalStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bid",
      default: null,
    },
    timePosted: {
      type: String,
      default: "Just now",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);

