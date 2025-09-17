import db from "../config/db.mjs";

export const createSale = async ({
  product_id,
  quantity,
  total_price,
  user_id,
}) => {
  const [result] = await db.query(
    "INSERT INTO sales (product_id, quantity, total_price, user_id) VALUES (?, ?, ?, ?)",
    [product_id, quantity, total_price, user_id]
  );

  return { id: result.insertId, product_id, quantity, total_price, user_id };
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

// Get sales by cashier (user_id)
export const getSalesByUser = async (user_id) => {
  const [rows] = await db.query(
    "SELECT s.id, s.product_id, p.name AS product_name, s.quantity, s.total_price, s.sale_date " +
      "FROM sales s LEFT JOIN  products p ON s.product_id = p.id " +
      "WHERE s.user_id = ? ORDER BY s.sale_date DESC",
    [user_id]
  );
  return rows;
};
