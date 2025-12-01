import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  // Assuming you have findUserByUsername or a similar uniqueness check
} from "../models/User.mjs";
import bcrypt from "bcryptjs"; // Need bcrypt for hashing new user passwords

// --- READ OPERATIONS (Scoped by Tenant) ---

export const fetchUsers = async (req, res) => {
  try {
    // 🔑 Extract the mandatory business_id from the authenticated user
    const { business_id } = req.user;

    // The model (getAllUsers) must now accept and use business_id for filtering
    const users = await getAllUsers(business_id);
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
};

export const fetchUserById = async (req, res) => {
  try {
    const { id } = req.params;
    // 🔑 Extract the mandatory business_id
    const { business_id } = req.user;

    // The model (getUserById) must now accept both ID and business_id for filtering
    const user = await getUserById(id, business_id);

    if (!user)
      // 404 response covers both "not found" AND "found but belongs to another tenant"
      return res
        .status(404)
        .json({ message: "User not found or access denied" });

    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch user", error: error.message });
  }
};

// --- WRITE OPERATIONS (Scoped by Tenant and Role) ---

export const addUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    // 🔑 Extract required fields from the authenticated user
    const { business_id } = req.user;

    if (!username || !password || !role) {
      return res
        .status(400)
        .json({ message: "Username, password, and role are required" });
    }

    // 🔒 ROLE CHECK: Admin should only add Cashier or Customer roles
    if (role !== "cashier" && role !== "customer") {
      return res.status(403).json({
        message:
          "Admins can only create users with 'cashier' or 'customer' roles.",
      });
    }

    // Hash the password for storage
    const hashedPassword = await bcrypt.hash(password, 10);

    // The model (createUser) must now accept the business_id
    const newUser = await createUser(
      username,
      hashedPassword,
      role,
      business_id // 🔑 Auto-assign the tenant ID
    );

    res.status(201).json({
      message: `New ${role} added successfully`,
      user: newUser,
    });
  } catch (error) {
    // Check for unique constraint violation (username already exists in the tenant)
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: `Username '${req.body.username}' already exists in this business.`,
      });
    }

    res
      .status(500)
      .json({ message: "Failed to create user", error: error.message });
  }
};

export const editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;
    // 🔑 Extract the mandatory business_id
    const { business_id } = req.user;

    // SECURITY: Prevent editing business_id or role to 'admin'
    if (updateFields.business_id || updateFields.role === "admin") {
      return res
        .status(403)
        .json({ message: "Cannot modify business ID or assign 'admin' role." });
    }

    // The model (updateUser) must now accept business_id for scoping
    const updated = await updateUser(id, updateFields, business_id);

    // Check if any row was affected (i.e., user was found in this tenant)
    if (!updated) {
      return res
        .status(404)
        .json({ message: "User not found or access denied." });
    }

    res.json(updated);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update user", error: error.message });
  }
};

export const removeUser = async (req, res) => {
  try {
    const { id } = req.params;
    // 🔑 Extract the mandatory business_id
    const { business_id } = req.user;

    // Prevent admin from deleting themselves (optional but recommended)
    if (id == req.user.id) {
      return res
        .status(403)
        .json({ message: "Cannot delete your own admin account." });
    }

    // The model (deleteUser) must now accept business_id for scoping
    const result = await deleteUser(id, business_id);

    // The model should throw an error if affectedRows is 0, but if it returns a simple object:
    if (result.message === "User not found or access denied.") {
      return res
        .status(404)
        .json({ message: "User not found or access denied." });
    }

    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
};
