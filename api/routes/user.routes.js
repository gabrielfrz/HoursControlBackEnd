import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import {
  createAutoPoint,
  getDaySummary,
  listAllPointsByAdmin,
  editPointByAdmin,
  deletePointByAdmin,
  createPointByAdmin,
} from "../controller/point.controller.js";

const router = express.Router();

// Estagiário
router.post("/register", authenticateToken, createAutoPoint);
router.get("/summary/:date?", authenticateToken, getDaySummary);

// Admin
router.get("/admin/:userId", authenticateToken, listAllPointsByAdmin);
router.put("/admin/edit/:pointId", authenticateToken, editPointByAdmin);
router.delete("/admin/delete/:pointId", authenticateToken, deletePointByAdmin);
router.post("/admin/manual", authenticateToken, createPointByAdmin);

export default router;
