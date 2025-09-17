import express from "express";
import { register, login } from "../controllers/authController.mjs";
import { protect, authorize } from "../middleware/authMiddleware.mjs";

const router = express.Router();

router.post("/register", protect, authorize("admin"), register);
router.post("/login", login);

export default router;
