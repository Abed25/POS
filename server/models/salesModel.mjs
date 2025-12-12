import db from "../config/db.mjs";

export const createSale = async ({
  product_id,
  selling_price,
  cost_price,
  quantity,
  total_price,
  user_id,
  business_id, // 🔑 NEW: Accept business_id
}) => {
  const [result] = await db.query(
    "INSERT INTO sales (product_id, selling_price, cost_price, quantity, total_price, user_id, business_id) VALUES (?, ?, ?, ?, ?, ?,?)", // 🔑 Insert business_id
    [
      product_id,
      selling_price,
      cost_price,
      quantity,
      total_price,
      user_id,
      business_id,
    ]
  );

  return {
    id: result.insertId,
    product_id,
    selling_price,
    cost_price,
    quantity,
    total_price,
    user_id,
    business_id,
  };
};

export const createBulkSales = async (salesArray, business_id) => {
  // 🔑 NEW: Accept business_id
  const queryParts = [];
  const queryValues = [];

  for (const sale of salesArray) {
    // Now adding a 6th value for business_id
    queryParts.push("(?, ?, ?, ?, ?, ?, ?)");
    queryValues.push(
      sale.product_id,
      sale.selling_price,
      sale.cost_price,
      sale.quantity,
      sale.total_price,
      sale.user_id,
      business_id // 🔑 Insert business_id for every sale record
    );
  }

  const sql = `
 INSERT INTO sales (product_id, selling_price, cost_price, quantity, total_price, user_id, business_id) 
 VALUES ${queryParts.join(", ")}
 `;

  const [result] = await db.query(sql, queryValues);

  return result;
};
// models/salesModel.mjs (Continued)

// Get all sales for the specified business_id, optionally filtered by userId
export const getSales = async (business_id, userId) => {
  // 🔑 Changed signature
  let whereClause = "WHERE s.business_id = ?"; // 🔑 Filter is MANDATORY
  const params = [business_id];

  if (userId) {
    // Conditionally add WHERE clause if userId is provided
    whereClause += " AND s.user_id = ?";
    params.push(userId);
  }

  const [rows] = await db.query(
    `
    SELECT  s.id, p.name AS product_name, s.selling_price,s.cost_price, s.quantity, s.total_price, u.username AS seller, s.sale_date, s.receipt_number
 FROM  sales s
 INNER JOIN  products p ON s.product_id = p.id
 INNER JOIN  users u ON s.user_id = u.id
 ${whereClause} 
 ORDER BY  s.sale_date DESC`,
    params
  );
  return rows;
};

// Get a single sale by ID for a specific business
// models/salesModel.mjs (Revised getSaleById function)
export const getSaleById = async (id, business_id) => {
  const [rows] = await db.query(
    `
    SELECT 
        s.id,
        p.name AS product_name,
        s.selling_price,
        s.cost_price,
        s.quantity,
        s.total_price,
        u.username AS seller,
        s.sale_date,
        s.receipt_number
    FROM 
        sales s
    INNER JOIN 
        products p ON s.product_id = p.id
    INNER JOIN 
        users u ON s.user_id = u.id
    WHERE 
        s.id = ? AND s.business_id = ?`,
    [id, business_id]
  );
  return rows[0];
};

// Get sales by date range for a specific business
export const getSalesByDateRange = async (from, to, business_id, userId) => {
  // 🔑 Changed signature
  let whereClause = "WHERE s.sale_date BETWEEN ? AND ? AND s.business_id = ?"; // 🔑 Filter is MANDATORY
  const params = [from, to, business_id];

  if (userId) {
    // Conditionally add user filter
    whereClause += " AND s.user_id = ?";
    params.push(userId);
  }

  const [rows] = await db.query(
    `SELECT 
s.id,
p.name AS product_name, 
u.username AS seller,
s.selling_price,
s.cost_price,
s.quantity,
s.total_price,
s.sale_date,
s.receipt_number
FROM 
sales s
INNER JOIN 
products p ON s.product_id = p.id
INNER JOIN 
users u ON s.user_id = u.id
${whereClause}
ORDER BY 
s.sale_date ASC`,
    params
  );
  return rows;
};

// NOTE: We can now deprecate getSalesByUser since getSales handles it by passing userId.
// If you still need it for clarity, here is the updated version:
export const getSalesByUser = async (user_id, business_id) => {
  // 🔑 Added business_id
  const [rows] = await db.query(
    `SELECT 
s.id,
p.name AS product_name, 
s.selling_price,
s.cost_price,
s.total_price,
u.username AS seller,
s.sale_date,
s.receipt_number
FROM 
sales s
LEFT JOIN 
products p ON s.product_id = p.id
INNER JOIN 
users u ON s.user_id = u.id 
WHERE 
s.user_id = ? AND s.business_id = ?
ORDER BY 
s.sale_date DESC`,
    [user_id, business_id]
  );
  return rows;
};
