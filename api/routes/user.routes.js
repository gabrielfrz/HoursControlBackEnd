import express from "express";
import {
  register,
  login,
  getAllUsers,
  updateUser
} from "../controller/user.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Rotas para usuários
router.post("/register", register);
router.post("/login", login);
router.get("/all", authenticateToken, getAllUsers);
router.put("/:id", authenticateToken, updateUser);

export default router;
