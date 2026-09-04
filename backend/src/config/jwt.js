import jwt from "jsonwebtoken";

export const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || "fixlink_secret_key_2026",
    { expiresIn: "30d" },
  );
};
