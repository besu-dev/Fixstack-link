import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../config/jwt.js";

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
      serviceRadius,
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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName: fullName.trim(),
      phone: formattedPhone,
      email: cleanEmail,
      password: hashedPassword,
      role: role || "customer",
      profession: profession || "",
      subcity: subcity || "Bole",
      serviceRadius: serviceRadius || "15 km",
      skills: skills || [],
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
      },
    });
  } catch (error) {
    console.error("--> Login error:", error);
    return res.status(500).json({ message: error.message });
  }
};
