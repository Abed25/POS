// routes/businessRoutes.mjs
import express from "express";
import {
  getMyBusinessDetails,
  updateMyBusiness,
  listAllBusinesses,
  getBusinessDetailsById,
} from "../controllers/businessController.mjs";

// Adjust path to your middleware file if needed
import { protect, authorize } from "../middleware/authMiddleware.mjs";

const router = express.Router();

// --- TENANT-SPECIFIC ROUTES (Accessed via /api/businesses/current) ---

/**
 * GET /api/businesses/current
 * Access: Tenant Admin/User
 */
router
  .route("/current")
  .get(
    protect,
    authorize("admin", "cashier", "customer"),
    getMyBusinessDetails
  );

/**
 * PUT /api/businesses/current
 * Access: Tenant Admin (assuming 'admin' is the role for business management)
 */
router.route("/current").put(protect, authorize("admin"), updateMyBusiness);

// --- SUPERADMIN ROUTES (Accessed via /api/businesses) ---

/**
 * GET /api/businesses
 * Access: Superadmin (platform_admin)
 */
router.route("/").get(protect, authorize("platform_admin"), listAllBusinesses);

/**
 * GET /api/businesses/:id
 * Access: Superadmin (platform_admin)
 */
router
  .route("/:id")
  .get(protect, authorize("platform_admin"), getBusinessDetailsById);

export default router;
