import { verifyToken } from "../helpers/jwt.js";
import { checkRole } from "../helpers/roleCheck.js";
import { User } from "../models/user.modal.js";

export const authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    try {
      let token;

      // 1. Header check
      const authHeader = req.headers["authorization"];
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }

      // 2. Cookie check 
      if (!token && req.cookies?.auth_token) {
        token = req.cookies.auth_token;
      }

      if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token" });
      }

      // 3. Verify
      const decoded = verifyToken(token, process.env.JWT_SECRET);
      if (!decoded) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      // 4. User find
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // 5. Role check
      if (!checkRole(user.role, roles)) {
        return res.status(403).json({ message: "Forbidden: Access denied" });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(500).json({
        message: "Auth middleware error",
        error: error.message,
      });
    }
  };
};
