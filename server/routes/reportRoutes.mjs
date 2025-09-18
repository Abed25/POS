import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.mjs";
import {
  getSalesReport,
  getStockReport,
} from "../controllers/ReportController.mjs";

const router = express.Router();

router.get("/sales", protect, authorize("admin"), getSalesReport);
router.get("/stock", protect, authorize("admin"), getStockReport);

export default router;
