import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.mjs";
import { getSalesReport } from "../controllers/ReportController.mjs";

const router = express.Router();

router.get("/sales", protect, authorize("admin"), getSalesReport);

export default router;
