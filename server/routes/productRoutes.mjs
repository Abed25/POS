// routes/productRoutes.mjs
import express from "express";
import {
  getAllProducts,
  getSingleProduct,
  addProduct,
  editProduct,
  patchProduct,
  removeProduct,
} from "../controllers/productController.mjs";

import { protect, isAdmin } from "../middleware/authMiddleware.mjs";

const router = express.Router();

// Public: view products
router.get("/", getAllProducts);
router.get("/:id", getSingleProduct);

// Admin only: manage products
router.post("/", protect, isAdmin, addProduct);
router.put("/:id", protect, isAdmin, editProduct);
router.patch("/:id", protect, isAdmin, patchProduct);
router.delete("/:id", protect, isAdmin, removeProduct);

export default router;
