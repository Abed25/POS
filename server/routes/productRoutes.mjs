// routes/productRoutes.mjs
import express from "express";
import {
  getAllProducts,
  getSingleProduct,
  addProduct,
  editProduct,
  removeProduct,
} from "../controllers/productController.mjs";

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products
router.get("/", getAllProducts);

// @route   GET /api/products/:id
// @desc    Get single product
router.get("/:id", getSingleProduct);

// @route   POST /api/products
// @desc    Add new product
router.post("/", addProduct);

// @route   PUT /api/products/:id
// @desc    Update product
router.put("/:id", editProduct);

// @route   DELETE /api/products/:id
// @desc    Delete product
router.delete("/:id", removeProduct);

export default router;
