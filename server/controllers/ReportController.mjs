import {
  fetchSalesBetweenDates,
  fetchStockReport,
} from "../models/ReportModel.mjs";

export const getSalesReport = async (req, res) => {
  try {
    const { start, end } = req.query;
    const user = req.user;

    if (!start || !end) {
      return res
        .status(400)
        .json({ message: "Please provide start and end dates" });
    }

    const rows = await fetchSalesBetweenDates(start, end, user);

    // Summary layer
    let totalRevenue = 0;
    let totalQuantity = 0;
    const productSales = {};

    rows.forEach((row) => {
      totalRevenue += parseFloat(row.total_price);
      totalQuantity += parseInt(row.quantity);

      if (!productSales[row.product_name]) {
        productSales[row.product_name] = { quantity: 0, revenue: 0 };
      }
      productSales[row.product_name].quantity += row.quantity;
      productSales[row.product_name].revenue += parseFloat(row.total_price);
    });

    // Top product
    let topProduct = null;
    let maxRevenue = 0;
    for (const [name, data] of Object.entries(productSales)) {
      if (data.revenue > maxRevenue) {
        topProduct = { name, ...data };
        maxRevenue = data.revenue;
      }
    }

    res.json({
      summary: { totalRevenue, totalQuantity, topProduct: topProduct || null },
      details: rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching sales report" });
  }
};

// Stock report
export const getStockReport = async (req, res) => {
  try {
    const rows = await fetchStockReport();

    // Add low-stock alerts
    const lowStockThreshold = 10;
    const lowStockItems = rows.filter((p) => p.stock < lowStockThreshold);

    res.json({
      summary: {
        totalProducts: rows.length,
        lowStockCount: lowStockItems.length,
      },
      lowStockItems,
      details: rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching stock report" });
  }
};
