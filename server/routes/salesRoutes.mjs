import express from "express";
import {
  addSale,
  getAllSales,
  getSingleSale,
  getSalesInRange,
} from "../controllers/salesController.mjs";
import { protect, authorize } from "../middleware/authMiddleware.mjs";

const router = express.Router();

router.post("/", protect, authorize("cashier", "admin"), addSale); // Record a new sale
router.get("/", protect, authorize("admin"), getAllSales); // Get all sales
router.get("/:id", protect, authorize("cashier", "admin"), getSingleSale); // Get one sale
router.get("/range", protect, authorize("cashier", "admin"), getSalesInRange); // Get sales in range
export default router;
