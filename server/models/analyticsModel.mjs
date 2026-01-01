import db from "../config/db.mjs";

export const getMonthlyPerformance = async (businessId) => {
  const query = `
    SELECT 
      DATE_FORMAT(sale_date, '%b') AS month, 
      SUM(total_price) AS revenue, 
      SUM((selling_price - cost_price) * quantity) AS profit 
    FROM sales 
    WHERE business_id = ? 
    GROUP BY MONTH(sale_date) 
    ORDER BY MONTH(sale_date) ASC
  `;

  const [rows] = await db.query(query, [businessId]);
  return rows;
};
