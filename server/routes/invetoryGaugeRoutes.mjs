import { Router } from "express";
import { getInventoryGaugeData } from "../controllers/InventoryGauge.mjs";
import { protect, authorize } from "../middleware/authMiddleware.mjs";

const router = Router();

// Protect the route to ensure business_id is extracted from the user session
router.get("/", protect, authorize("admin"), getInventoryGaugeData);

export default router;
