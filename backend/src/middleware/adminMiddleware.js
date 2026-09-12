/**
 * Admin Middleware
 * Verifies that the authenticated user possesses the 'admin' role
 */

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({
    message: "Access forbidden: Administrator privileges required.",
  });
};
