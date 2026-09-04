import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, default: "", trim: true },
    email: { type: String, default: "", lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "provider"],
      default: "customer",
    },
    profession: { type: String, default: "" },
    subcity: { type: String, default: "Bole" },
    serviceRadius: { type: String, default: "15 km" },
    skills: [{ type: String }],
    // Verification documents
    kebeleIdUrl: { type: String, default: "" },
    tradeCertUrl: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 5.0 },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
