import bcrypt from "bcryptjs";
import { createUser, findUserByUsername } from "../models/User.mjs";
import { generateToken } from "../utils/generateToken.mjs";

export async function register(req, res) {
  try {
    const { username, password, role } = req.body;

    const existingUser = await findUserByUsername(username);
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await createUser(
      username,
      hashedPassword,
      role || "customer"
    );

    res.status(201).json({ message: "User registered", userId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body;

    const user = await findUserByUsername(username);
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    res.json({ message: "Login successful", token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get logged-in user details
export const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by protect middleware
    const { id, username, email, role, created_at } = req.user;
    res.json({
      id,
      username,
      email,
      role,
      created_at,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user details" });
  }
};
