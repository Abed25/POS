// routes/productRoutes.mjs
import express from "express";
import {
  getAllProducts,
  getSingleProduct,
  addProduct,
  editProduct,
  patchProduct,
  removeProduct,
  getProductSummary,
} from "../controllers/productController.mjs";

import { protect, authorize } from "../middleware/authMiddleware.mjs";

const router = express.Router();

// Cashier & admin: view products
router.get("/", protect, authorize("admin", "cashier"), getAllProducts);
router.get("/summary", protect, authorize("admin"), getProductSummary);
router.get("/:id", protect, authorize("admin", "cashier"), getSingleProduct);

// Admin only: manage products
router.post("/", protect, authorize("admin"), addProduct);
router.put("/:id", protect, authorize("admin"), editProduct);
router.patch("/:id", protect, authorize("admin"), patchProduct);
router.delete("/:id", protect, authorize("admin"), removeProduct);

export default router;
