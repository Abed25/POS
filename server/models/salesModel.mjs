import db from "../config/db.mjs";

export const createSale = async ({
  product_id,
  unit_price,
  quantity,
  total_price,
  user_id,
}) => {
  const [result] = await db.query(
    "INSERT INTO sales (product_id,unit_price, quantity, total_price, user_id) VALUES (?, ?, ?, ?, ?)",
    [product_id, unit_price, quantity, total_price, user_id]
  );

  return {
    id: result.insertId,
    product_id,
    unit_price,
    quantity,
    total_price,
    user_id,
  };
};


export const getSales = async (userId) => { // <-- Accept optional userId
  let whereClause = "";
  const params = [];

  if (userId) { // <-- Conditionally add WHERE clause if userId is provided
    whereClause = "WHERE s.user_id = ?";
    params.push(userId);
  }

  const [rows] = await db.query(
    `SELECT 
        s.id,
        p.name AS product_name,
        s.unit_price,
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
    ${whereClause} 
    ORDER BY 
        s.sale_date DESC`,
    params // Pass the parameters array
  );
  return rows;
};

// ... (getSaleById remains the same)

export const getSaleById = async (id) => {
  const [rows] = await db.query(
    `SELECT 
    s.id,
    p.name AS product_name,
    s.unit_price,
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
WHERE s.id = ?`,
    [id]
  );
  return rows[0];
};

// Get sales by date range
// Get sales by date range
export const getSalesByDateRange = async (from, to, userId) => { // <-- Accept optional userId
  let whereClause = "WHERE s.sale_date BETWEEN ? AND ?";
  const params = [from, to];

  if (userId) { // <-- Conditionally add user filter
    whereClause += " AND s.user_id = ?";
    params.push(userId);
  }

  const [rows] = await db.query(
    `SELECT 
        s.id,
        p.name AS product_name, 
        u.username AS seller,  
        s.unit_price,
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
    params // Pass the parameters array
  );
  return rows;
};

// NOTE: You can now remove or deprecate getSalesByUser since getSales now handles it.

// Get sales by cashier (user_id)
export const getSalesByUser = async (user_id) => {
  const [rows] = await db.query(
    `SELECT 
        s.id,
        p.name AS product_name, 
        s.unit_price,           
        s.quantity,
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
        s.user_id = ?
    ORDER BY 
        s.sale_date DESC`,
    [user_id]
  );
  return rows;
};
