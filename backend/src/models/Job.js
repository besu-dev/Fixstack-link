import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
      default: "General Maintenance",
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    subcity: {
      type: String,
      required: true,
      trim: true,
      default: "Bole", // Default fallback
    },
    specificLocation: { type: String, default: "", trim: true },
    budget: { type: Number, required: true },
    urgency: {
      type: String,
      enum: ["Emergency", "Today", "Flexible"],
      default: "Today",
    },
    photos: [{ type: String }],
    status: {
      type: String,
      enum: ["open", "assigned", "completed", "cancelled"],
      default: "open",
    },
    assignedProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Job", jobSchema);
