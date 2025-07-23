import express from "express";
import {
  register,
  login,
  getAllUsers,
  updateUser,
  deleteUser
} from "../controller/user.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Rotas para usuários
router.post("/register", register);
router.post("/login", login);
router.get("/all", authenticateToken, getAllUsers);
router.put("/users/:id", authenticateToken, updateUser);
router.delete("/users/:id", authenticateToken, deleteUser); 

export default router;
