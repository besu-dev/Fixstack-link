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

    // Replaced serviceRadius with experience
    experience: { type: String, default: "1 - 3 years" },
    skills: [{ type: String }],

    kebeleIdUrl: { type: String, default: "" },
    tradeCertUrl: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 5.0 },

    connectsBalance: {
      type: Number,
      default: 5,
      min: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
    featuredUntil: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
