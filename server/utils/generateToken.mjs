import jwt from "jsonwebtoken";

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || "secret123",
    { expiresIn: "1d" }
  );
}
