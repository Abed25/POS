import {
  createSale,
  getSales,
  getSaleById,
  getSalesByDateRange,
  getSalesByUser,
  createBulkSales,
} from "../models/salesModel.mjs";
import { updateProductStock, getProductById } from "../models/productModel.mjs";

export const addSale = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const userId = req.user.id; // 👈 comes from the logged-in cashier/admin

    if (!product_id || !quantity) {
      return res
        .status(400)
        .json({ message: "Product ID and quantity are required" });
    }
    console.log("Logged in user ID:", req.user.id);

    // 1. Find product
    const product = await getProductById(product_id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 2. Check stock
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    // 3. Calculate total price
    const unit_price = product.price;
    const total_price = unit_price * quantity;

    // 4. Insert into sales with userId
    const newSale = await createSale({
      product_id,
      unit_price,
      quantity,
      total_price,
      user_id: userId, // 👈 add user ID
    });

    // 5. Reduce stock
    await updateProductStock(product_id, quantity);

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

// In salesController.mjs

export const getAllSales = async (req, res) => {
  try {
    // 1. Get user details from the secure middleware object
    const userRole = req.user.role; // Assuming role is attached by middleware
    const userId = req.user.id; // ID is attached by middleware (from token)

    let sales;

    if (userRole === "admin") {
      // ADMIN: Fetch ALL sales (call model function without ID)
      sales = await getSales();
    } else if (userRole === "cashier") {
      // CASHIER: Fetch ONLY their sales (call model function with ID)
      // This uses the updated getSales(userId) you implemented in the model
      sales = await getSales(userId);
    } else {
      // CUSTOMER or unhandled role: No access to the general list
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

export const getSingleSale = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await getSaleById(id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    res.json(sale);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch sale", error: error.message });
  }
};

// In salesController.mjs

export const getSalesInRange = async (req, res) => {
  try {
    const { from, to } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;

    if (!from || !to) {
      return res
        .status(400)
        .json({ message: "Please provide from and to dates" });
    }

    let sales;
    if (userRole === "admin") {
      // ADMIN: Fetch ALL sales in range
      sales = await getSalesByDateRange(from, to);
    } else if (userRole === "cashier") {
      // CASHIER: Fetch ONLY their sales in range
      // This uses the updated getSalesByDateRange(from, to, userId) model function
      sales = await getSalesByDateRange(from, to, userId);
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

export const getMySales = async (req, res) => {
  try {
    const userId = req.user.id; // from token
    const sales = await getSalesByUser(userId);

    res.status(200).json(sales);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch sales", error: error.message });
  }
};

// NEW CONTROLLER FUNCTION
export const addBulkSale = async (req, res) => {
  try {
    // Expecting an array of simple sales objects: [{product_id, quantity}, ...]
    const salesData = req.body;
    // Securely get the user ID from the token
    const userId = req.user.id;

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
      }

      // 1. Find and validate product/stock for each item
      const product = await getProductById(product_id);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product ID ${product_id} not found.` });
      }
      if (product.stock < quantity) {
        return res
          .status(400)
          .json({
            message: `Not enough stock for ${product.name}. Available: ${product.stock}`,
          });
      }

      // 2. Calculate details and build DB entry
      const unit_price = product.price;
      const total_price = unit_price * quantity;
      totalPriceSum += total_price;

      // Prepare the fully detailed object for the model function
      salesForDB.push({
        product_id,
        unit_price,
        quantity,
        total_price,
        user_id: userId, // Enforce logged-in user ID
      });

      // 3. Prepare stock updates
      stockUpdates.push({ product_id, quantity });
    }

    // 4. Insert all sales in one go (Bulk Operation)
    const result = await createBulkSales(salesForDB);

    // 5. Reduce stock for all products
    // NOTE: This should ideally be a bulk operation too, but we use the existing function.
    for (const { product_id, quantity } of stockUpdates) {
      await updateProductStock(product_id, quantity);
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
