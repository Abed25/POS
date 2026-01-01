import { getMonthlyPerformance } from "../models/analyticsModel.mjs";

export const getSalesPerformance = async (req, res) => {
  try {
    // IMPORTANT: Get business_id from the authenticated user (req.user)
    // This ensures Musa only sees Musa's data.
    const businessId = req.user.business_id;

    if (!businessId) {
      return res
        .status(400)
        .json({ message: "Business ID is missing from user session." });
    }

    const data = await getMonthlyPerformance(businessId);

    // Map the data to ensure numbers are floats, not strings (common with MySQL decimals)
    const formattedData = data.map((item) => ({
      month: item.month,
      revenue: parseFloat(item.revenue) || 0,
      profit: parseFloat(item.profit) || 0,
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Analytics Error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch sales performance data." });
  }
};
