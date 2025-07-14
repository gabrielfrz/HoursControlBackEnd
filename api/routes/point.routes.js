import express from "express";
import {
  createPoint,
  listPoints,
  listPointsByAdmin
} from "../controller/point.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Criar ponto (usuário autenticado)
router.post("/", authenticateToken, createPoint);

// Listar pontos do próprio usuário autenticado
router.get("/", authenticateToken, listPoints);

// Listar pontos de qualquer usuário (Admin)
router.get("/:userId", authenticateToken, listPointsByAdmin);

export default router;
