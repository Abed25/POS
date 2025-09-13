import express from "express";
import {
  addSale,
  getAllSales,
  getSingleSale,
} from "../controllers/salesController.mjs";

const router = express.Router();

router.post("/", addSale); // Record a new sale
router.get("/", getAllSales); // Get all sales
router.get("/:id", getSingleSale); // Get one sale

export default router;
