import bcrypt from "bcryptjs";
import {
  createUser,
  findUserByUsername,
  updateUserBusinessId,
} from "../models/User.mjs";
// Import the new business model function
import {
  createBusiness,
  findBusinessByName,
} from "../models/businessModel.mjs";
import { generateToken } from "../utils/generateToken.mjs";

// 1. REGISTER: Create a new Business/Tenant and assign the user to it
export async function register(req, res) {
  try {
    // Get all required inputs
    const { username, password, role, businessName } = req.body;

    // --- CHECK 1: Validate Required Inputs ---
    if (!username || !password || !businessName) {
      return res.status(400).json({
        message: "Username, password, and business name are required.",
      });
    } // --- CHECK 2: User Availability ---

    const existingUser = await findUserByUsername(username);
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // --- CHECK 3: Business Name Availability 🔑 ---
    const existingBusiness = await findBusinessByName(businessName);
    if (existingBusiness)
      return res.status(400).json({
        message: `The business name '${businessName}' is already taken.`,
      });

    const hashedPassword = await bcrypt.hash(password, 10); // --- STEP 1: Create Initial User Record with NULL business_id ---

    const userId = await createUser(
      username,
      hashedPassword,
      role || "admin",
      null
    ); // --- STEP 2: Create Business Record, using the actual businessName and new userId ---

    const newBusinessId = await createBusiness(
      businessName, // Use the validated name
      userId
    ); // --- STEP 3: Update the User with the correct, newly created business_id ---

    await updateUserBusinessId(userId, newBusinessId);

    res.status(201).json({
      message: "Tenant and Admin user registered",
      userId,
      business_id: newBusinessId,
    });
  } catch (error) {
    // Handle potential errors from database or business creation
    res.status(500).json({ message: `Registration failed: ${error.message}` });
  }
}

// 2. LOGIN: Retrieve and sign the Business ID into the token
export async function login(req, res) {
  try {
    const { username, password } = req.body;

    // 🔑 findUserByUsername must now return user.business_id
    const user = await findUserByUsername(username);
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // CRITICAL CHECK: User must be associated with a business to proceed
    if (!user.business_id) {
      return res
        .status(403)
        .json({ message: "User is not assigned to a business/tenant." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // 🔑 generateToken must include user.business_id in the JWT payload
    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      role: user.role,
      business_id: user.business_id, // Expose to client for context
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// 3. Get logged-in user details
export const getCurrentUser = async (req, res) => {
  try {
    // 🔑 req.user is set by protect middleware and MUST include business_id now
    const { id, username, email, role, business_id, created_at } = req.user;

    res.json({
      id,
      username,
      email,
      role,
      business_id, // Now available from the JWT
      created_at,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user details" });
  }
};
