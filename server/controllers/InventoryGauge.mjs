import db from "../config/db.mjs"; // Assuming this is your pool or connection

export const getInventoryGaugeData = async (req, res) => {
  try {
    // business_id should come from your auth middleware (JWT/Session)
    const businessId = req.user.business_id;

    // Query both tables in one go for efficiency
    const query = `
      SELECT 
        (SELECT SUM(cost_price * quantity) FROM sales WHERE business_id = ?) as total_cogs,
        (SELECT SUM(cost_price * stock) FROM products WHERE business_id = ?) as current_inventory_value
      `;

    const [rows] = await db.execute(query, [businessId, businessId]);
    const { total_cogs, current_inventory_value } = rows[0];

    // Convert to numbers and handle nulls
    const cogs = parseFloat(total_cogs || 0);
    const inventoryVal = parseFloat(current_inventory_value || 0);

    // Calculate Turnover Rate (Avoid division by zero)
    const turnoverRate =
      inventoryVal > 0 ? parseFloat((cogs / inventoryVal).toFixed(2)) : 0;

    // Calculate Days of Stock (365 / turnover)
    const daysOfStock = turnoverRate > 0 ? Math.round(365 / turnoverRate) : 0;

    // Monthly COGS for the footer (KES)
    const monthlyCogs = parseFloat((cogs / 12).toFixed(2));

    res.json({
      turnoverRate,
      daysOfStock,
      monthlyCogs,
      vsLastYear: 0.3, // You can expand this later with a date-filtered query
      maxRate: 10, // This sets the '100%' mark for your gauge
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
