import db from "../config/db.mjs";
import bcrypt from "bcryptjs";

// --- CORE REGISTRATION FUNCTIONS (Pre-Auth) ---

// Create a new user (used in the registration process)
export async function createUser(username, hashedPassword, role, businessId) {
  // 🔑 Added businessId
  const [result] = await db.execute(
    "INSERT INTO users (username, password, role, business_id) VALUES (?, ?, ?, ?)", // 🔑 Insert business_id
    [username, hashedPassword, role, businessId]
  );
  return result.insertId;
}

// Find user by username (used during login, before business_id is known)
export async function findUserByUsername(username) {
  const [rows] = await db.execute("SELECT * FROM users WHERE username = ?", [
    username,
  ]);
  return rows[0];
}

// Function to update the user's business_id after the business record is created.
export const updateUserBusinessId = async (userId, businessId) => {
  if (!businessId) {
    throw new Error("Cannot update user with invalid business ID.");
  } // This remains scoped only by userId as it is part of the initial registration sequence.
  await db.query("UPDATE users SET business_id = ? WHERE id = ?", [
    businessId,
    userId,
  ]);
};

// --- TENANT-SCOPED CRUD OPERATIONS ---

// Get all users FOR A SPECIFIC BUSINESS
export const getAllUsers = async (business_id) => {
  // 🔑 Added business_id parameter
  const [rows] = await db.query(
    // Filter by business_id
    "SELECT id, username, role, business_id, created_at FROM users WHERE business_id = ? ORDER BY created_at DESC",
    [business_id]
  );
  return rows;
};

// Get one user BY ID AND BUSINESS ID
export const getUserById = async (id, business_id) => {
  // 🔑 Added business_id parameter
  const [rows] = await db.query(
    // Filter by BOTH ID and business_id
    "SELECT id, username, role, business_id, created_at FROM users WHERE id = ? AND business_id = ?",
    [id, business_id]
  );
  return rows[0];
};

// Update user BY ID AND BUSINESS ID
export const updateUser = async (
  id,
  { username, password, role },
  business_id
) => {
  // 🔑 Added business_id parameter
  let query = "UPDATE users SET ";
  const values = []; // --- Build dynamic update fields ---

  if (username) {
    query += "username = ?, ";
    values.push(username);
  }
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    query += "password = ?, ";
    values.push(hashedPassword);
  }
  if (role) {
    query += "role = ?, ";
    values.push(role);
  }
  if (values.length === 0) {
    // No fields to update
    return getUserById(id, business_id);
  } // remove last comma

  query = query.slice(0, -2); // CRITICAL: Filter by BOTH ID and business_id
  query += " WHERE id = ? AND business_id = ?";
  values.push(id, business_id); // 🔑 Append both IDs to the values array

  await db.query(query, values); // Return the updated user, scoped by business_id
  return getUserById(id, business_id);
};

// Delete user BY ID AND BUSINESS ID
export const deleteUser = async (id, business_id) => {
  // 🔑 Added business_id parameter
  // CRITICAL: Filter by BOTH ID and business_id
  const [result] = await db.query(
    "DELETE FROM users WHERE id = ? AND business_id = ?",
    [id, business_id]
  );

  if (result.affectedRows === 0) {
    throw new Error("User not found or access denied.");
  }

  return { message: "User deleted" };
};
