// controllers/salesController.mjs
import {
  createSale,
  getSales,
  getSaleById,
  getSalesByDateRange,
  getSalesByUser, // Note: This function is now redundant, but we'll update it
  createBulkSales,
} from "../models/salesModel.mjs";
import { updateProductStock, getProductById } from "../models/productModel.mjs";

// @desc    Create a single sale record
// @route   POST /api/sales
export const addSale = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const userId = req.user.id;
    // 🔑 NEW: Get the tenant ID
    const businessId = req.user.business_id;

    if (!product_id || !quantity) {
      return res
        .status(400)
        .json({ message: "Product ID and quantity are required" });
    }
    console.log("Logged in user ID:", req.user.id); // 1. Find product (MUST use businessId filter in model)

    const product = await getProductById(product_id, businessId);

    if (!product) {
      // This ensures the product is both found AND belongs to the tenant
      return res
        .status(404)
        .json({ message: "Product not found or access denied" });
    } // 2. Check stock

    if (product.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    } // 3. Calculate total price

    const selling_price = product.price;
    const cost_price = product.cost_price;
    const total_price = selling_price * quantity; // 4. Insert into sales with both user and business ID

    const newSale = await createSale({
      product_id,
      selling_price,
      cost_price,
      quantity,
      total_price,
      user_id: userId,
      business_id: businessId, // 🔑 Pass businessId
    }); // 5. Reduce stock (MUST use businessId filter in model)

    await updateProductStock(product_id, quantity, businessId);

    res.status(201).json({
      message: "Sale recorded successfully",
      ...newSale,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to record sale",
      error: error.message,
    });
  }
};

// @desc    Get all sales (Scoped by role AND tenant)
// @route   GET /api/sales
export const getAllSales = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;
    // 🔑 NEW: Get the tenant ID
    const businessId = req.user.business_id;

    let sales;

    if (userRole === "admin") {
      // ADMIN: Fetch ALL sales for this business (pass ONLY businessId)
      // Note: The getSales model function now requires businessId as the first argument
      sales = await getSales(businessId);
    } else if (userRole === "cashier") {
      // CASHIER: Fetch ONLY their sales for this business (pass both IDs)
      sales = await getSales(businessId, userId);
    } else {
      return res
        .status(403)
        .json({ message: "Role not authorized to view sales list" });
    }

    res.json(sales);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch sales", error: error.message });
  }
};

// @desc    Get single sale by ID
// @route   GET /api/sales/:id
export const getSingleSale = async (req, res) => {
  try {
    const { id } = req.params;
    // 🔑 NEW: Get the tenant ID
    const businessId = req.user.business_id; // Pass BOTH sale ID and business ID for strict isolation

    const sale = await getSaleById(id, businessId);

    if (!sale)
      return res
        .status(404)
        .json({ message: "Sale not found or access denied" });
    // OPTIONAL: Add a final role check if only the user who made the sale can view it
    // if (req.user.role === 'cashier' && sale.user_id !== req.user.id) {
    //     return res.status(403).json({ message: "Access denied. Not your sale." });
    // }

    res.json(sale);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch sale", error: error.message });
  }
};

// @desc    Get sales by date range (Scoped by role AND tenant)
// @route   GET /api/sales/range?from=...&to=...
export const getSalesInRange = async (req, res) => {
  try {
    const { from, to } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;
    // 🔑 NEW: Get the tenant ID
    const businessId = req.user.business_id;

    if (!from || !to) {
      return res
        .status(400)
        .json({ message: "Please provide from and to dates" });
    }

    let sales;

    if (userRole === "admin") {
      // ADMIN: Fetch ALL sales in range for this business
      sales = await getSalesByDateRange(from, to, businessId); // Pass ONLY businessId
    } else if (userRole === "cashier") {
      // CASHIER: Fetch ONLY their sales in range for this business
      sales = await getSalesByDateRange(from, to, businessId, userId); // Pass BOTH IDs
    } else {
      return res
        .status(403)
        .json({ message: "Role not authorized to view sales reports" });
    }

    res.json(sales);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch sales", error: error.message });
  }
};

// @desc    Get sales logged by the currently authenticated user (cashier)
// @route   GET /api/sales/my
export const getMySales = async (req, res) => {
  try {
    const userId = req.user.id;
    // 🔑 NEW: Get the tenant ID
    const businessId = req.user.business_id; // Use the getSales function which now handles both filtering modes

    const sales = await getSales(businessId, userId);

    res.status(200).json(sales);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch sales", error: error.message });
  }
};

// @desc    Record multiple sales (Bulk Operation)
// @route   POST /api/sales/bulk
export const addBulkSale = async (req, res) => {
  try {
    const salesData = req.body;
    const userId = req.user.id;
    // 🔑 NEW: Get the tenant ID
    const businessId = req.user.business_id;

    if (!Array.isArray(salesData) || salesData.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid or empty sales array provided." });
    }

    const salesForDB = [];
    const stockUpdates = [];
    let totalPriceSum = 0;

    for (const sale of salesData) {
      const { product_id, quantity } = sale;

      if (!product_id || quantity <= 0) {
        return res
          .status(400)
          .json({ message: "Invalid product_id or quantity in cart." });
      } // 1. Find and validate product/stock for each item (Must use businessId)

      const product = await getProductById(product_id, businessId);

      if (!product) {
        return res.status(404).json({
          message: `Product ID ${product_id} not found or access denied.`,
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}. Available: ${product.stock}`,
        });
      } // 2. Calculate details and build DB entry

      const selling_price = product.price;
      const cost_price = product.cost_price;
      const total_price = selling_price * quantity;
      totalPriceSum += total_price; // Prepare the fully detailed object for the model function

      salesForDB.push({
        product_id,
        selling_price,
        cost_price,
        quantity,
        total_price,
        user_id: userId,
        business_id: businessId, // 🔑 Add business ID to the bulk data
      }); // 3. Prepare stock updates

      stockUpdates.push({ product_id, quantity });
    } // 4. Insert all sales in one go (Bulk Operation)

    const result = await createBulkSales(salesForDB, businessId); // 5. Reduce stock for all products (MUST use businessId filter in model)

    for (const { product_id, quantity } of stockUpdates) {
      await updateProductStock(product_id, quantity, businessId);
    }

    res.status(201).json({
      message: `${
        salesData.length
      } items sold successfully (Total KES ${totalPriceSum.toFixed(2)})`,
      rowsAffected: result.affectedRows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to record bulk sales",
      error: error.message,
    });
  }
};
