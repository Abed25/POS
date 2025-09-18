import db from "../config/db.mjs";

export const fetchSalesBetweenDates = async (start, end, user) => {
  let query = `
    SELECT s.id, s.product_id, p.name AS product_name, s.quantity, s.total_price, s.sale_date, u.username AS cashier
    FROM sales s
    JOIN products p ON s.product_id = p.id
    JOIN users u ON s.user_id = u.id
    WHERE DATE(s.sale_date) BETWEEN ? AND ?
  `;
  const params = [start, end];

  if (user.role === "cashier") {
    query += " AND s.user_id = ?";
    params.push(user.id);
  }

  query += " ORDER BY s.sale_date DESC";
  const [rows] = await db.query(query, params);
  return rows;
};

// Fetch current stock levels
export const fetchStockReport = async () => {
  const [rows] = await db.query(`
    SELECT id, name, stock, category, price
    FROM products
    ORDER BY stock ASC
  `);
  return rows;
};
