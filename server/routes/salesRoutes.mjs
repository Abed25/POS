import express from "express";
import {
  addSale,
  getAllSales,
  getSingleSale,
  getSalesInRange,
} from "../controllers/salesController.mjs";
import { protect, isAdmin } from "../middleware/authMiddleware.mjs";

const router = express.Router();

router.post("/", addSale); // Record a new sale
router.get("/", getAllSales); // Get all sales
router.get("/:id", getSingleSale); // Get one sale
router.get("/range", getSalesInRange); // Get sales in range
export default router;
