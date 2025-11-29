import db from "../config/db.mjs";
import bcrypt from "bcryptjs";

export async function createUser(username, hashedPassword, role) {
  const [result] = await db.execute(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
    [username, hashedPassword, role]
  );
  return result.insertId;
}

export async function findUserByUsername(username) {
  const [rows] = await db.execute("SELECT * FROM users WHERE username = ?", [
    username,
  ]);
  return rows[0];
}

// Get all users
export const getAllUsers = async () => {
  const [rows] = await db.query(
    "SELECT id, username, role, created_at FROM users ORDER BY created_at DESC"
  );
  return rows;
};

// Get one user
export const getUserById = async (id) => {
  const [rows] = await db.query(
    "SELECT id, username, role, created_at FROM users WHERE id = ?",
    [id]
  );
  return rows[0];
};

// Update user
export const updateUser = async (id, { username, password, role }) => {
  let query = "UPDATE users SET ";
  const values = [];

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

  // remove last comma
  query = query.slice(0, -2);
  query += " WHERE id = ?";
  values.push(id);

  await db.query(query, values);
  return getUserById(id);
};

// Delete user
export const deleteUser = async (id) => {
  await db.query("DELETE FROM users WHERE id = ?", [id]);
  return { message: "User deleted" };
};

// models/User.mjs (Add this function)
// ... (Your existing model imports and functions like findUserByUsername)

// Function to update the user's business_id after the business record is created.
export const updateUserBusinessId = async (userId, businessId) => {
  // CRITICAL: Ensure businessId is not zero or null before updating,
  // although it should be correct if createBusiness worked.
  if (!businessId) {
    throw new Error("Cannot update user with invalid business ID.");
  }

  // Use the id column to target the correct user
  await db.query("UPDATE users SET business_id = ? WHERE id = ?", [
    businessId,
    userId,
  ]);
};

// ... (Rest of User.mjs)
