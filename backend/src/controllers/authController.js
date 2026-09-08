import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Review from "../models/Review.js";
import { generateToken } from "../config/jwt.js";
import {
  uploadAvatarToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
} from "../config/cloudinary.js";

const isEmail = (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);

const formatPhone = (phone) => {
  if (!phone) return "";
  let cleaned = phone.replace(/[\s\-()]/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "+251" + cleaned.substring(1);
  } else if (cleaned.startsWith("251")) {
    cleaned = "+" + cleaned;
  } else if (!cleaned.startsWith("+251") && /^\d+$/.test(cleaned)) {
    cleaned = "+251" + cleaned;
  }
  return cleaned;
};

// Maps specific sub-service names from services to the broader technician professions
const CATEGORY_MAP = {
  // Plumbing
  "Tanker Pump": "Plumbing & Water Systems",
  "Tanker Pump & Booster": "Plumbing & Water Systems",
  "Pipe Leak": "Plumbing & Water Systems",
  "Pipe Leak & Line Repair": "Plumbing & Water Systems",
  "Water Heater": "Plumbing & Water Systems",
  "Water Heater (Boiler)": "Plumbing & Water Systems",
  "Bathroom Fit": "Plumbing & Water Systems",
  "Bathroom & Kitchen Fitting": "Plumbing & Water Systems",
  "Faucet & Toilet Repair": "Plumbing & Water Systems",

  // Electrical
  "House Wiring": "Electrical & Power",
  "Switch & Socket": "Electrical & Power",
  "Switch & Socket Repair": "Electrical & Power",
  "Circuit Breaker": "Electrical & Power",
  "Circuit Breaker Repair": "Electrical & Power",
  "Breaker Fix": "Electrical & Power",
  "Generator": "Electrical & Power",
  "Generator Repair": "Electrical & Power",
  "Solar System": "Electrical & Power",
  "Solar System Repair": "Electrical & Power",
  "Lighting & Fixtures": "Electrical & Power",
  "Lighting Repair": "Electrical & Power",

  // Appliances
  "Washing Machine": "Appliances & Electronics",
  "Refrigerator": "Appliances & Electronics",
  "Refrigerator & Freezer": "Appliances & Electronics",
  "TV & Satellite": "Appliances & Electronics",
  "Electric Stove": "Appliances & Electronics",
  "Electric Stove (Mitad)": "Appliances & Electronics",
  "Microwave & Oven": "Appliances & Electronics",

  // Carpentry & Metalwork
  "Compound Gate": "Carpentry & Metalwork",
  "Compound Gate & Welding": "Carpentry & Metalwork",
  "Gate Repair": "Carpentry & Metalwork",
  "Gate & Metalwork": "Carpentry & Metalwork",
  "Lock & Key": "Carpentry & Metalwork",
  "Furniture": "Carpentry & Metalwork",
  "Furniture & Woodwork": "Carpentry & Metalwork",
  "Roof Sheet": "Carpentry & Metalwork",
  "Roof Sheet Repair": "Carpentry & Metalwork",

  // Finishing & Cleaning
  "Wall Painting": "Finishing & Cleaning",
  "Tile Repair": "Finishing & Cleaning",
  "Tile & Granite Repair": "Finishing & Cleaning",
  "Deep Cleaning": "Finishing & Cleaning",
  "Moving & Loading": "Finishing & Cleaning",
};

export const register = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      email,
      password,
      role,
      profession,
      subcity,
      location,
      experience,
      skills,
    } = req.body;

    console.log("--> Registration incoming body:", req.body);

    if (!fullName?.trim() || !password) {
      return res
        .status(400)
        .json({ message: "Full name and password are required" });
    }

    if (!phone?.trim() && !email?.trim()) {
      return res
        .status(400)
        .json({ message: "Please provide either a phone number or email" });
    }

    const formattedPhone = phone ? formatPhone(phone.trim()) : "";
    const cleanEmail = email ? email.trim().toLowerCase() : "";

    const duplicateConditions = [];
    if (formattedPhone) duplicateConditions.push({ phone: formattedPhone });
    if (cleanEmail) duplicateConditions.push({ email: cleanEmail });

    if (duplicateConditions.length > 0) {
      const existingUser = await User.findOne({ $or: duplicateConditions });
      if (existingUser) {
        return res.status(400).json({
          message: "An account with this phone or email already exists",
        });
      }
    }

    // Safely parse skills array
    let parsedSkills = [];
    if (skills) {
      try {
        parsedSkills = typeof skills === "string" ? JSON.parse(skills) : skills;
      } catch {
        parsedSkills = Array.isArray(skills) ? skills : [skills];
      }
    }

    // Capture uploaded document paths from multer
    const kebeleIdUrl = req.files?.kebeleId?.[0]?.path || "";
    const tradeCertUrl = req.files?.tradeCert?.[0]?.path || "";

    // Upload profile avatar to Cloudinary if attached
    let avatarUrl = req.body.avatarUrl || "";
    let avatarPublicId = "";

    const avatarFile = req.files?.avatar?.[0];
    if (avatarFile) {
      try {
        const cloudRes = await uploadAvatarToCloudinary(avatarFile.path);
        avatarUrl = cloudRes.avatarUrl;
        avatarPublicId = cloudRes.avatarPublicId;
      } catch (cloudErr) {
        console.error("--> Cloudinary registration avatar upload error:", cloudErr.message);
        // Fallback: use local uploaded file path so registration does not break
        avatarUrl = `/${avatarFile.path.replace(/\\/g, "/")}`;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Normalize role string to match ["customer", "provider"]
    const normalizedRole =
      role === "service_provider" || role === "provider"
        ? "provider"
        : "customer";

    const newUser = await User.create({
      fullName: fullName.trim(),
      phone: formattedPhone,
      email: cleanEmail,
      password: hashedPassword,
      role: normalizedRole,
      profession: profession || "",
      subcity: subcity || location || "Bole",
      experience: experience || "1 - 3 years",
      skills: parsedSkills,
      kebeleIdUrl,
      tradeCertUrl,
      avatarUrl,
      avatarPublicId,
      connectsBalance: 5,
    });

    console.log("--> User successfully saved to MongoDB:", newUser._id);

    const token = generateToken(newUser._id, newUser.role);

    return res.status(201).json({
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        phone: newUser.phone,
        email: newUser.email,
        role: newUser.role,
        profession: newUser.profession,
        subcity: newUser.subcity,
        experience: newUser.experience,
        skills: newUser.skills,
        avatarUrl: newUser.avatarUrl || "",
        connectsBalance: newUser.connectsBalance,
      },
    });
  } catch (error) {
    console.error("--> Registration error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, phone, email, password } = req.body;
    const loginKey = (identifier || phone || email || "").trim();

    console.log("--> Login attempt with:", loginKey);

    if (!loginKey || !password) {
      return res
        .status(400)
        .json({ message: "Please enter your email/phone and password" });
    }

    const searchConditions = [];

    if (isEmail(loginKey)) {
      searchConditions.push({ email: loginKey.toLowerCase() });
    } else {
      const formatted = formatPhone(loginKey);
      searchConditions.push({ phone: formatted });
      searchConditions.push({ phone: loginKey });
    }

    const user = await User.findOne({ $or: searchConditions });

    if (!user) {
      console.log("--> User not found for:", searchConditions);
      return res
        .status(401)
        .json({ message: "Invalid email/phone or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("--> Password mismatch for:", user._id);
      return res
        .status(401)
        .json({ message: "Invalid email/phone or password" });
    }

    console.log("--> Login successful for:", user.fullName);

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role,
        profession: user.profession,
        subcity: user.subcity,
        experience: user.experience,
        skills: user.skills,
        avatarUrl: user.avatarUrl || "",
        connectsBalance: user.connectsBalance,
        isFeatured: user.isFeatured || false,
      },
    });
  } catch (error) {
    console.error("--> Login error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile & wallet connects
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password").lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("--> getMe error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update current user profile info & avatar
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, subcity, profession, experience, skills, removeAvatar } =
      req.body;
    const updateFields = {};

    if (fullName && fullName.trim()) updateFields.fullName = fullName.trim();
    if (phone && phone.trim()) updateFields.phone = formatPhone(phone.trim());
    if (subcity && subcity.trim()) updateFields.subcity = subcity.trim();
    if (profession && profession.trim())
      updateFields.profession = profession.trim();
    if (experience && experience.trim())
      updateFields.experience = experience.trim();

    if (skills) {
      try {
        updateFields.skills =
          typeof skills === "string" ? JSON.parse(skills) : skills;
      } catch {
        updateFields.skills = Array.isArray(skills) ? skills : [skills];
      }
    }

    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user requested to remove their profile photo
    if (removeAvatar === "true" || removeAvatar === true) {
      if (currentUser.avatarPublicId) {
        await deleteFromCloudinary(currentUser.avatarPublicId);
      } else if (currentUser.avatarUrl) {
        const publicId = extractPublicId(currentUser.avatarUrl);
        if (publicId) await deleteFromCloudinary(publicId);
      }
      updateFields.avatarUrl = "";
      updateFields.avatarPublicId = "";
    }
    // Check if a new avatar file was uploaded via multer
    else if (req.file) {
      try {
        const cloudRes = await uploadAvatarToCloudinary(req.file.path);

        // Delete previous avatar from Cloudinary
        if (currentUser.avatarPublicId) {
          await deleteFromCloudinary(currentUser.avatarPublicId);
        } else if (currentUser.avatarUrl) {
          const oldPublicId = extractPublicId(currentUser.avatarUrl);
          if (oldPublicId) await deleteFromCloudinary(oldPublicId);
        }

        updateFields.avatarUrl = cloudRes.avatarUrl;
        updateFields.avatarPublicId = cloudRes.avatarPublicId;
      } catch (cloudErr) {
        console.error("--> Cloudinary profile avatar upload error:", cloudErr);
        return res
          .status(500)
          .json({ message: "Failed to upload profile picture to Cloudinary" });
      }
    } else if (req.body.avatarUrl !== undefined) {
      updateFields.avatarUrl = req.body.avatarUrl;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true },
    ).select("-password");

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("--> updateProfile error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Remove user profile avatar
// @route   DELETE /api/auth/avatar
// @access  Private
export const deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.avatarPublicId) {
      await deleteFromCloudinary(user.avatarPublicId);
    } else if (user.avatarUrl) {
      const oldPublicId = extractPublicId(user.avatarUrl);
      if (oldPublicId) await deleteFromCloudinary(oldPublicId);
    }

    user.avatarUrl = "";
    user.avatarPublicId = "";
    await user.save();

    return res.status(200).json({
      message: "Avatar removed successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        avatarUrl: "",
      },
    });
  } catch (error) {
    console.error("--> deleteAvatar error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle technician availability status
// @route   PUT /api/auth/availability
// @access  Private (Provider)
export const updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { isAvailable: Boolean(isAvailable) } },
      { new: true },
    ).select("isAvailable fullName");

    return res.status(200).json({
      message: `Availability changed to ${user.isAvailable ? "Online" : "Offline"}`,
      isAvailable: user.isAvailable,
    });
  } catch (error) {
    console.error("--> updateAvailability error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get verified technicians (Sponsored/Featured prioritized)
// @route   GET /api/auth/providers
// @access  Public
export const getProviders = async (req, res) => {
  try {
    const { category, subcity, search } = req.query;

    let query = { role: { $in: ["provider", "service_provider"] } };

    // 1. Resolve sub-service to category or match specific skills
    if (category && category !== "All") {
      const mappedProfession = CATEGORY_MAP[category] || category;
      const rootKeyword = category.split(" ")[0];

      query.$or = [
        { profession: { $regex: mappedProfession, $options: "i" } },
        { profession: { $regex: category, $options: "i" } },
        { profession: { $regex: rootKeyword, $options: "i" } },
        {
          skills: {
            $in: [new RegExp(category, "i"), new RegExp(rootKeyword, "i")],
          },
        },
      ];
    }

    // 2. Subcity filter
    if (subcity) {
      query.subcity = subcity;
    }

    // 3. Search query filter
    if (search) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      query.$and = [
        {
          $or: [
            { fullName: searchRegex },
            { profession: searchRegex },
            { subcity: searchRegex },
            { skills: searchRegex },
          ],
        },
      ];
    }

    const now = new Date();

    const rawProviders = await User.find(query)
      .select(
        "fullName phone profession skills experience rating isVerified isAvailable avatarUrl isFeatured featuredUntil subcity",
      )
      .lean();

    // Check if the promotion period is currently active
    const providers = rawProviders.map((p) => {
      const isCurrentlyFeatured = Boolean(
        p.isFeatured && p.featuredUntil && new Date(p.featuredUntil) > now,
      );
      return {
        ...p,
        isFeatured: isCurrentlyFeatured,
      };
    });

    // Rank: Active featured providers first, then by rating
    providers.sort((a, b) => {
      if (b.isFeatured !== a.isFeatured) {
        return Number(b.isFeatured) - Number(a.isFeatured);
      }
      return (b.rating || 5) - (a.rating || 5);
    });

    return res.status(200).json(providers);
  } catch (error) {
    console.error("--> getProviders error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get public technician details with real database metrics
// @route   GET /api/auth/provider/:id
// @access  Public
export const getProviderById = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await User.findById(id).select("-password").lean();
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // Real number of completed jobs from the database
    const completedOrders = await Job.countDocuments({
      assignedProvider: id,
      status: "completed",
    });

    // Real ratings from reviews with customer avatar and details
    const reviews = await Review.find({ provider: id })
      .populate("customer", "fullName avatarUrl")
      .sort({ createdAt: -1 })
      .lean();

    let realRating = null;
    let reviewCount = reviews.length;

    if (reviewCount > 0) {
      const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
      realRating = parseFloat((sum / reviewCount).toFixed(1));
    } else {
      // Check if any completed jobs have embedded rating
      const ratedJobs = await Job.find({
        assignedProvider: id,
        rating: { $exists: true, $ne: null, $gt: 0 },
      }).lean();

      if (ratedJobs.length > 0) {
        reviewCount = ratedJobs.length;
        const sum = ratedJobs.reduce((acc, j) => acc + Number(j.rating || 0), 0);
        realRating = parseFloat((sum / reviewCount).toFixed(1));
      }
    }

    // Safely normalize skills array
    let skills = provider.skills || [];
    if (typeof skills === "string") {
      try {
        skills = JSON.parse(skills);
      } catch {
        skills = skills.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
    if (!Array.isArray(skills)) {
      skills = [];
    }

    return res.status(200).json({
      user: {
        ...provider,
        completedOrders,
        rating: realRating,
        reviewCount,
        skills,
        reviews: reviews || [],
      },
    });
  } catch (error) {
    console.error("--> getProviderById error:", error);
    return res.status(500).json({ message: error.message });
  }
};

