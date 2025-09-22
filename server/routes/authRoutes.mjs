import express from "express";
import {
  register,
  login,
  getCurrentUser,
} from "../controllers/authController.mjs";
import { protect, authorize } from "../middleware/authMiddleware.mjs";

const router = express.Router();

router.post("/register", protect, authorize("admin"), register);
router.post("/login", login);
router.get("/me", protect, getCurrentUser);

export default router;
