// middleware/authMiddleware.mjs
import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    res.status(401).json({ message: "Token failed" });
  }
};

// Role-based middleware
export const isAdmin = (req, res, next) => {
  if (req.user?.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Admin access only" });
};

export const isCashier = (req, res, next) => {
  if (req.user?.role === "cashier") {
    return next();
  }
  return res.status(403).json({ message: "Cashier access only" });
};
