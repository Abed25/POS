import express from "express";
import {
  addSale,
  getAllSales,
  getSingleSale,
  getSalesInRange,
  getMySales,
} from "../controllers/salesController.mjs";
import { protect, authorize } from "../middleware/authMiddleware.mjs";

const router = express.Router();

router.post("/", protect, authorize("cashier", "admin"), addSale); // Record a new sale
// Cashier gets only their sales
router.get("/my", protect, authorize("cashier", "admin"), getMySales);
router.get("/", protect, authorize("admin"), getAllSales); // Get all sales
router.get("/:id", protect, authorize("cashier", "admin"), getSingleSale); // Get one sale
router.get("/range", protect, authorize("admin"), getSalesInRange); // Get sales in range

export default router;
