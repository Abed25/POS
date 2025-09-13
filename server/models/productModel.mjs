// models/productModel.mjs
import db from "../config/db.mjs";

// Get all products
export const getProducts = async () => {
  const [rows] = await db.query(
    "SELECT * FROM products ORDER BY created_at DESC"
  );
  return rows;
};

// Get a single product by ID
export const getProductById = async (id) => {
  const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
  return rows[0];
};

// Create a new product
export const createProduct = async (product) => {
  const { name, description, price, stock, category, sku } = product;
  const [result] = await db.query(
    "INSERT INTO products (name, description, price, stock, category, sku) VALUES (?, ?, ?, ?, ?, ?)",
    [name, description, price, stock, category, sku]
  );
  return { id: result.insertId, ...product };
};

// Update an existing product
export const updateProduct = async (id, product) => {
  const { name, description, price, stock, category, sku } = product;
  await db.query(
    "UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category = ?, sku = ? WHERE id = ?",
    [name, description, price, stock, category, sku, id]
  );
  return { id, ...product };
};

// PATCH product (dynamic update)
export const patchProduct = async (id, fields) => {
  if (Object.keys(fields).length === 0) {
    throw new Error("No fields provided for update");
  }

  const updates = Object.keys(fields)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = Object.values(fields);

  const [result] = await db.query(
    `UPDATE products SET ${updates} WHERE id = ?`,
    [...values, id]
  );

  return result;
};

// Delete a product
export const deleteProduct = async (id) => {
  await db.query("DELETE FROM products WHERE id = ?", [id]);
  return { message: "Product deleted successfully" };
};

// Update stock quantity safely
export const updateProductStock = async (product_id, quantity) => {
  // 1. Get current stock
  const [rows] = await db.query("SELECT stock FROM products WHERE id = ?", [
    product_id,
  ]);

  if (rows.length === 0) {
    throw new Error("Product not found");
  }

  const currentStock = rows[0].stock;

  // 2. Check availability
  if (quantity > currentStock) {
    throw new Error("Not enough stock available for this sale");
  }

  // 3. Update stock
  await db.query("UPDATE products SET stock = stock - ? WHERE id = ?", [
    quantity,
    product_id,
  ]);
};
