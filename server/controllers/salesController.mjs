import { createSale, getSales, getSaleById } from "../models/salesModel.mjs";
import { updateProductStock } from "../models/productModel.mjs";
import { getProductById } from "../models/productModel.mjs";

export const addSale = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {
      return res
        .status(400)
        .json({ message: "Product ID and quantity are required" });
    }

    // 1. Find product
    const product = await getProductById(product_id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 2. Calculate total price
    const total_price = product.price * quantity;

    // 3. Insert into sales
    const newSale = await createSale({
      product_id,
      quantity,
      total_price,
    });

    // 4. Reduce stock
    await updateProductStock(product_id, quantity);

    res.status(201).json(newSale);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to record sale", error: error.message });
  }
};

export const getAllSales = async (req, res) => {
  try {
    const sales = await getSales();
    res.json(sales);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch sales", error: error.message });
  }
};

export const getSingleSale = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await getSaleById(id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    res.json(sale);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch sale", error: error.message });
  }
};
