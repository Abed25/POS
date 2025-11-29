// utils/generateToken.mjs
import jwt from "jsonwebtoken";

// Assume JWT_SECRET is available in the environment
// Assume the token should expire in a reasonable timeframe, e.g., 30 days

export const generateToken = (user) => {
  // CRITICAL: Construct the payload with the essential multi-tenant identifier
  const payload = {
    id: user.id,
    role: user.role,
    business_id: user.business_id, // 🔑 TENANT IDENTIFIER
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "30d", // Or your desired expiry time
  });
};
