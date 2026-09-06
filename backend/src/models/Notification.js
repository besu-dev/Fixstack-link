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
      required: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    urgency: {
      type: String,
      enum: ["Emergency", "Today", "Flexible"],
      default: "Today",
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
