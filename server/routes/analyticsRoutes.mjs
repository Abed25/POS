import express from "express";
import { getSalesPerformance } from "../controllers/analyticsController.mjs";
import { protect, authorize } from "../middleware/authMiddleware.mjs";

const router = express.Router();

// This route will be: GET /api/analytics/performance
router.get("/performance", protect, authorize("admin"), getSalesPerformance);

export default router;
