import {
  fetchSalesMetrics,
  fetchUserMetrics,
  fetchInventoryValue,
} from "../models/kpiModel.mjs";

/**
 * Helper to calculate percentage trend
 */
function calculateTrend(cp, pp) {
  if (pp === 0) return cp > 0 ? 1000 : 0;
  return ((cp - pp) / pp) * 100;
}

/**
 * GET /api/kpis
 * Fetch all KPI data for authenticated user's business
 */
export const getKpis = async (req, res) => {
  const businessId = req.user?.business_id;
  const periodDays = 30;

  if (!businessId) {
    return res.status(401).json({
      message: "Authentication required: business_id missing.",
    });
  }

  try {
    // Fetch metrics in parallel
    const [salesMetrics, userMetrics, inventoryValue] = await Promise.all([
      fetchSalesMetrics(businessId, periodDays),
      fetchUserMetrics(businessId, periodDays),
      fetchInventoryValue(businessId),
    ]);

    const {
      revenue_cp,
      revenue_pp,
      profit_cp,
      profit_pp,
      orders_cp,
      orders_pp,
    } = salesMetrics;

    const { new_users_cp, new_users_pp } = userMetrics;

    // Average order values
    const avgOrderValue_cp = orders_cp > 0 ? revenue_cp / orders_cp : 0;
    const avgOrderValue_pp = orders_pp > 0 ? revenue_pp / orders_pp : 0;

    // Build KPI response structure
    const kpis = [
      {
        title: "Total Revenue",
        value: revenue_cp,
        trend: calculateTrend(revenue_cp, revenue_pp),
        currency: "KES",
        icon_key: "dollar_sign",
        period: `Last ${periodDays} Days`,
      },
      {
        title: "Gross Profit",
        value: profit_cp,
        trend: calculateTrend(profit_cp, profit_pp),
        currency: "KES",
        icon_key: "trending_up",
        period: `Last ${periodDays} Days`,
      },
      {
        title: "Total Orders",
        value: orders_cp,
        trend: calculateTrend(orders_cp, orders_pp),
        currency: "",
        icon_key: "shopping_cart",
        period: `Last ${periodDays} Days`,
      },
      {
        title: "Avg Order Value",
        value: avgOrderValue_cp,
        trend: calculateTrend(avgOrderValue_cp, avgOrderValue_pp),
        currency: "KES",
        icon_key: "calculator",
        period: `Last ${periodDays} Days`,
      },
      {
        title: "Current Inventory Value",
        value: inventoryValue,
        trend: 0,
        currency: "KES",
        icon_key: "package",
        period: "Point in Time",
      },
      {
        title: "New Registered Users",
        value: new_users_cp,
        trend: calculateTrend(new_users_cp, new_users_pp),
        currency: "",
        icon_key: "users",
        period: `Last ${periodDays} Days`,
      },
    ];

    // Round values cleanly
    const formatted = kpis.map((kpi) => ({
      ...kpi,
      value: Number(kpi.value)?.toFixed(2) * 1,
      trend: Number(kpi.trend)?.toFixed(1) * 1,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("KPI fetch error:", error);

    res.status(500).json({
      message: "Failed to load KPI data",
      detail: error?.sqlMessage || error?.message || "Unknown error",
    });
  }
};
