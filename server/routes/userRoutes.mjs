import express from "express";
import {
  fetchUsers,
  fetchUserById,
  addUser,
  editUser,
  removeUser,
} from "../controllers/userController.mjs";
import { protect, authorize } from "../middleware/authMiddleware.mjs";

const router = express.Router();

//only admin
router.get("/", protect, authorize("admin"), fetchUsers);
router.get("/:id", protect, authorize("admin"), fetchUserById);
router.post("/", protect, authorize("admin"), addUser);
router.patch("/:id", protect, authorize("admin"), editUser);
router.delete("/:id", protect, authorize("admin"), removeUser);

export default router;
