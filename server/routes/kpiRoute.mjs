import express from "express";
import { getKpis } from "../controllers/kpiController.mjs";
import { protect, authorize } from "../middleware/authMiddleware.mjs";

const router = express.Router();

// GET /api/kpis
router.get("/", protect, authorize("admin"), getKpis);

export default router;
