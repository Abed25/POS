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

// Delete a product
export const deleteProduct = async (id) => {
  await db.query("DELETE FROM products WHERE id = ?", [id]);
  return { message: "Product deleted successfully" };
};
