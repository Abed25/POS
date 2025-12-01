// models/Business.mjs
import db from "../config/db.mjs";

// /**
//  * Creates a new business (tenant) record and assigns the founding user as the owner.
//  * @param {string} name - The name of the new business.
//  * @param {number} ownerId - The ID of the first user/admin (the owner).
//  * @returns {number} The insert ID (the new business_id).
//  */
export const createBusiness = async (name, ownerId) => {
  const [result] = await db.query(
    "INSERT INTO businesses (name, owner_id) VALUES (?, ?)",
    [name, ownerId]
  );
  return result.insertId;
};

export const findBusinessByName = async (businessName) => {
  const [rows] = await db.query(
    "SELECT id FROM businesses WHERE business_name = ?",
    [businessName]
  );
  return rows[0]; // Returns the business object or undefined/null
};

// /**
//  * Finds a business ID and details based on its unique name (used for login scoping).
//  * @param {string} name - The name of the business.
//  * @returns {object|null} Business object containing id (as business_id), name, owner_id, etc.
//  */
export const searchBusinessByName = async (name) => {
  const [rows] = await db.query(
    "SELECT id AS business_id, name, owner_id, created_at FROM businesses WHERE name = ?",
    [name]
  );
  return rows[0];
};

// /**
//  * Gets a business by its ID. Used by both tenant admins and platform admin.
//  * @param {number} id - The business ID.
//  * @returns {object} The business data.
//  */
export const getBusinessById = async (id) => {
  const [rows] = await db.query(
    "SELECT id AS business_id, name, owner_id, created_at FROM businesses WHERE id = ?",
    [id]
  );
  return rows[0];
};

// /**
//  * Updates a business name.
//  * @param {number} id - The business ID.
//  * @param {string} name - The new name.
//  * @returns {object} Database result.
//  */
export const updateBusinessName = async (id, name) => {
  const [result] = await db.query(
    "UPDATE businesses SET name = ? WHERE id = ?",
    [name, id]
  );
  return result;
};

// /**
//  * Gets all businesses (Platform Admin view).
//  * @returns {Array<object>} List of all business data.
//  */
export const getAllBusinesses = async () => {
  const [rows] = await db.query(
    "SELECT id AS business_id, name, owner_id, created_at FROM businesses ORDER BY created_at DESC"
  );
  return rows;
};
