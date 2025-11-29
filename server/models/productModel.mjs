import db from "../config/db.mjs";

// --- CRUD Operations (Scoped to Tenant) ---

// Get all products FOR A SPECIFIC BUSINESS
export const getProducts = async (business_id) => {
  // CRITICAL: Filter by business_id
  const [rows] = await db.query(
    "SELECT * FROM products WHERE business_id = ? ORDER BY created_at DESC",
    [business_id]
  );
  return rows;
};

// Get a single product by ID FOR A SPECIFIC BUSINESS
export const getProductById = async (id, business_id) => {
  // CRITICAL: Filter by both product ID and business_id
  const [rows] = await db.query(
    "SELECT * FROM products WHERE id = ? AND business_id = ?",
    [id, business_id]
  );
  return rows[0];
};

// Create a new product FOR A SPECIFIC BUSINESS
export const createProduct = async (product, business_id) => {
  const { name, description, price, stock, category, sku } = product;
  // CRITICAL: Include business_id in the INSERT query
  const [result] = await db.query(
    "INSERT INTO products (name, description, price, stock, category, sku, business_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [name, description, price, stock, category, sku, business_id]
  );
  // Remember that currency is in KES.
  return { id: result.insertId, business_id, ...product, currency: "KES" };
};

// Update an existing product FOR A SPECIFIC BUSINESS
export const updateProduct = async (id, product, business_id) => {
  const { name, description, price, stock, category, sku } = product;
  // CRITICAL: Filter by product ID AND business_id
  await db.query(
    "UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category = ?, sku = ? WHERE id = ? AND business_id = ?",
    [name, description, price, stock, category, sku, id, business_id]
  );
  return { id, business_id, ...product };
};

// PATCH product (dynamic update) FOR A SPECIFIC BUSINESS
export const patchProduct = async (id, fields, business_id) => {
  if (Object.keys(fields).length === 0) {
    throw new Error("No fields provided for update");
  }

  const updates = Object.keys(fields)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = Object.values(fields);

  // CRITICAL: Filter by product ID AND business_id
  const [result] = await db.query(
    `UPDATE products SET ${updates} WHERE id = ? AND business_id = ?`,
    [...values, id, business_id]
  );

  return result;
};

// Delete a product FOR A SPECIFIC BUSINESS
export const deleteProduct = async (id, business_id) => {
  // CRITICAL: Filter by product ID AND business_id
  await db.query("DELETE FROM products WHERE id = ? AND business_id = ?", [
    id,
    business_id,
  ]);
  return { message: "Product deleted successfully" };
};

// Update stock quantity safely FOR A SPECIFIC BUSINESS
export const updateProductStock = async (product_id, quantity, business_id) => {
  // 1. Get current stock - CRITICAL: Filter by both IDs
  const [rows] = await db.query(
    "SELECT stock FROM products WHERE id = ? AND business_id = ?",
    [product_id, business_id]
  );

  if (rows.length === 0) {
    // If rows is 0, the product ID doesn't exist OR it belongs to a different business
    throw new Error("Product not found");
  }

  const currentStock = rows[0].stock;

  // 2. Check availability
  if (quantity > currentStock) {
    throw new Error("Not enough stock available for this sale");
  }

  // 3. Update stock - CRITICAL: Filter by both IDs
  await db.query(
    "UPDATE products SET stock = stock - ? WHERE id = ? AND business_id = ?",
    [quantity, product_id, business_id]
  );
};

// --- Summary (Scoped to Tenant) ---

// Get product count and total stock value FOR A SPECIFIC BUSINESS
export const getSummary = async (business_id) => {
  // Define the two SQL queries - CRITICAL: Filter BOTH queries
  const countQuery =
    "SELECT COUNT(*) AS product_count FROM products WHERE business_id = ?";
  const valueQuery =
    "SELECT SUM(price * stock) AS total_stock_value FROM products WHERE business_id = ?";

  // Execute both queries concurrently, passing the business_id to each
  const [[countResult], [valueResult]] = await Promise.all([
    db.query(countQuery, [business_id]),
    db.query(valueQuery, [business_id]),
  ]);

  // Extract and return results
  const product_count = countResult[0].product_count;
  const total_stock_value = valueResult[0].total_stock_value;

  return {
    product_count,
    total_stock_value,
    currency: "KES", // Adding currency context as per your stored information
  };
};
