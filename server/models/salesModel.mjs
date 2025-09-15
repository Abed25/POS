import db from "../config/db.mjs";

export const createSale = async ({ product_id, quantity, total_price }) => {
  const [result] = await db.query(
    "INSERT INTO sales (product_id, quantity, total_price) VALUES (?, ?, ?)",
    [product_id, quantity, total_price]
  );
  return { id: result.insertId, product_id, quantity, total_price };
};

export const getSales = async () => {
  const [rows] = await db.query("SELECT * FROM sales ORDER BY sale_date DESC");
  return rows;
};

export const getSaleById = async (id) => {
  const [rows] = await db.query("SELECT * FROM sales WHERE id = ?", [id]);
  return rows[0];
};

// Get sales by date range
export const getSalesByDateRange = async (from, to) => {
  const [rows] = await db.query(
    "SELECT * FROM sales WHERE sale_date BETWEEN ? AND ? ORDER BY sale_date ASC",
    [from, to]
  );
  return rows;
};
