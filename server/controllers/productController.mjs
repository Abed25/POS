// controllers/productController.mjs
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getSummary,
} from "../models/productModel.mjs";
import { patchProduct as patchProductModel } from "../models/productModel.mjs";

// @desc    Get all products
// @route   GET /api/products
export const getAllProducts = async (req, res) => {
  try {
    // 🔑 Extract business_id from the authenticated user
    const { business_id } = req.user;

    const products = await getProducts(business_id); // Pass the tenant ID
    res.status(200).json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
export const getSingleProduct = async (req, res) => {
  try {
    // 🔑 Extract business_id from the authenticated user
    const { business_id } = req.user; // Pass BOTH product ID and business_id for isolation

    const product = await getProductById(req.params.id, business_id);

    if (!product) {
      // If the product exists but belongs to another business, it returns null/undefined
      // The 404 response covers both "not found" and "not authorized to view"
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch product", error: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/products
export const addProduct = async (req, res) => {
  try {
    // 🔑 Extract business_id from the authenticated user
    const { business_id } = req.user;

    const {
      name,
      description,
      price,
      cost_price,
      stock,
      max_stock,
      min_stock,
      category,
      supplier,
    } = req.body;

    if (!name || !price || !cost_price || !stock) {
      return res
        .status(400)
        .json({ message: "Name, price,cost_price and s stock are required" });
    }

    const newProduct = await createProduct(
      {
        name,
        description,
        price,
        cost_price,
        stock,
        max_stock,
        min_stock,
        category,
        supplier,
      },
      business_id
    ); // Pass the tenant ID for creation

    res.status(201).json(newProduct);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create product", error: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
export const editProduct = async (req, res) => {
  try {
    // 🔑 Extract business_id from the authenticated user
    const { business_id } = req.user;

    const {
      name,
      description,
      price,
      cost_price,
      stock,
      max_stock,
      min_stock,
      category,
      supplier,
    } = req.body; // Pass the product ID, the update data, and the tenant ID for scoping

    const updatedProduct = await updateProduct(
      req.params.id,
      {
        name,
        description,
        price,
        cost_price,
        stock,
        max_stock,
        min_stock,
        category,
        supplier,
      },
      business_id
    );

    res.status(200).json(updatedProduct);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update product", error: error.message });
  }
};

// Patch product(Partial update)
export const patchProduct = async (req, res) => {
  try {
    // 🔑 Extract business_id from the authenticated user
    const { business_id } = req.user;

    const { id } = req.params;
    const fields = req.body; // Pass the product ID, the update fields, and the tenant ID

    const result = await patchProductModel(id, fields, business_id);

    if (result.affectedRows === 0) {
      // This could mean "not found" OR "found but belongs to another business"
      return res
        .status(404)
        .json({ message: "Product not found or access denied" });
    }

    res.json({ message: "Product updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update product", error: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
export const removeProduct = async (req, res) => {
  try {
    // 🔑 Extract business_id from the authenticated user
    const { business_id } = req.user; // Pass BOTH product ID and business_id for deletion scoping

    const deleted = await deleteProduct(req.params.id, business_id);

    res.status(200).json(deleted);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete product", error: error.message });
  }
};

/**
 * Controller function to get the product summary (count and total stock value).
 */
export const getProductSummary = async (req, res) => {
  try {
    // 🔑 Extract business_id from the authenticated user
    const { business_id } = req.user; // 1. Call the getSummary function from the model, passing the tenant ID

    const summaryData = await getSummary(business_id); // 2. Respond with the summary data

    res.status(200).json(summaryData);
  } catch (error) {
    console.error("Error fetching product summary:", error); // 3. Handle errors and send a 500 status code
    res.status(500).json({
      message: "Failed to retrieve product summary.",
      error: error.message,
    });
  }
};
