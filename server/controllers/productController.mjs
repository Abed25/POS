// controllers/productController.mjs
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../models/productModel.mjs";

// @desc    Get all products
// @route   GET /api/products
export const getAllProducts = async (req, res) => {
  try {
    const products = await getProducts();
    res.status(200).json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
export const getSingleProduct = async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch product", error: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/products
export const addProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, sku } = req.body;

    if (!name || !price || !stock || !sku) {
      return res
        .status(400)
        .json({ message: "Name, price, stock, and SKU are required" });
    }

    const newProduct = await createProduct({
      name,
      description,
      price,
      stock,
      category,
      sku,
    });
    res.status(201).json(newProduct);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create product", error: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
export const editProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, sku } = req.body;

    const updatedProduct = await updateProduct(req.params.id, {
      name,
      description,
      price,
      stock,
      category,
      sku,
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update product", error: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
export const removeProduct = async (req, res) => {
  try {
    const deleted = await deleteProduct(req.params.id);
    res.status(200).json(deleted);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete product", error: error.message });
  }
};
