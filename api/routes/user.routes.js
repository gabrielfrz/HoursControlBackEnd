import express from "express";
import {
  register,
  login,
  getAllUsers,
  updateUser
} from "../controller/user.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Listar todos os usuários (Admin)
router.get("/all", authenticateToken, getAllUsers);

// Atualizar nome ou foto (Admin)
router.put("/:id", authenticateToken, updateUser);

export default router;
