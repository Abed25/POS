import db from "../config/db.mjs";

/**
 * SALES METRICS MODEL
 * Computes revenue, profit, & order counts for current & previous period.
 */

export async function fetchSalesMetrics(businessId, periodDays) {
  const sql = `
      SELECT
          /* CURRENT PERIOD */
          SUM(
              CASE WHEN sale_date >= NOW() - INTERVAL ? DAY
                   THEN total_price END
          ) AS revenue_cp,

          SUM(
              CASE WHEN sale_date >= NOW() - INTERVAL ? DAY
                   THEN ((selling_price - cost_price) * quantity) END
          ) AS profit_cp,

          SUM(
              CASE WHEN sale_date >= NOW() - INTERVAL ? DAY
                   THEN 1 END
          ) AS orders_cp,

          /* PREVIOUS PERIOD */
          SUM(
              CASE WHEN sale_date >= NOW() - INTERVAL ? DAY
                   AND sale_date < NOW() - INTERVAL ? DAY
                   THEN total_price END
          ) AS revenue_pp,

          SUM(
              CASE WHEN sale_date >= NOW() - INTERVAL ? DAY
                   AND sale_date < NOW() - INTERVAL ? DAY
                   THEN ((selling_price - cost_price) * quantity) END
          ) AS profit_pp,

          SUM(
              CASE WHEN sale_date >= NOW() - INTERVAL ? DAY
                   AND sale_date < NOW() - INTERVAL ? DAY
                   THEN 1 END
          ) AS orders_pp

      FROM sales
      WHERE business_id = ?;
  `;

  // Previous period = days → days * 2 window
  const ppStart = periodDays * 2;

  const params = [
    periodDays, // cp revenue
    periodDays, // cp profit
    periodDays, // cp orders

    ppStart, // revenue_pp start
    periodDays, // revenue_pp end

    ppStart, // profit_pp start
    periodDays, // profit_pp end

    ppStart, // orders_pp start
    periodDays, // orders_pp end

    businessId, // business filter
  ];

  const [rows] = await db.execute(sql, params);
  return rows[0];
}

/**
 * USER METRICS MODEL
 */
export async function fetchUserMetrics(businessId, periodDays) {
  const sql = `
        SELECT
            /* Current period new users */
            SUM(
                CASE WHEN created_at >= NOW() - INTERVAL ? DAY
                     THEN 1 END
            ) AS new_users_cp,

            /* Previous period new users */
            SUM(
                CASE WHEN created_at >= NOW() - INTERVAL (? * 2) DAY
                     AND created_at < NOW() - INTERVAL ? DAY
                     THEN 1 END
            ) AS new_users_pp

        FROM users
        WHERE business_id = ?;
    `;

  const params = [
    periodDays,
    periodDays, // *2
    periodDays, // end
    businessId,
  ];

  const [rows] = await db.execute(sql, params);
  return rows[0];
}

/**
 * INVENTORY VALUE MODEL
 */
export async function fetchInventoryValue(businessId) {
  const sql = `
        SELECT SUM(stock * price) AS inventory_value
        FROM products
        WHERE business_id = ?;
    `;

  const [rows] = await db.execute(sql, [businessId]);
  return rows[0].inventory_value || 0;
}
