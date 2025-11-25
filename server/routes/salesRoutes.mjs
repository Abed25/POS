import express from "express";
import {
  addSale,
  getAllSales, // <--- This function will now handle both "all" and "filtered"
  getSingleSale,
  getSalesInRange,
  // getMySales, <--- REMOVED
} from "../controllers/salesController.mjs";
import { protect, authorize } from "../middleware/authMiddleware.mjs";

const router = express.Router();

router.post("/", protect, authorize("cashier", "admin"), addSale); // Record a new sale

// Consolidated Route: Handles all sales and also filtered sales using req.query.userId
router.get("/range", protect, authorize("admin", "cashier"), getSalesInRange); // Get sales in date range
router.get("/", protect, authorize("admin", "cashier"), getAllSales); // Get all sales OR filtered sales
router.get("/:id", protect, authorize("cashier", "admin"), getSingleSale); // Get one sale

export default router;
