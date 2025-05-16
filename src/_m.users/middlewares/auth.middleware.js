// middlewares/requireAuth.js
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/config.js";
import User from "../models/User.js";

async function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const userDoc = await User.findById(decoded.userId);
    if (!userDoc) return res.status(401).json({ message: "User not found" });

    req.user = userDoc; // makes `req.user` available
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export default authMiddleware;
