import express from "express";
import {
  createAutoPoint,
  getDaySummary,
  deleteAllPointsFromUserForDay,
  deleteSinglePointFromUser
} from "../controller/point.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", authenticateToken, createAutoPoint);
router.get("/summary/:date?", authenticateToken, getDaySummary);
router.delete("/delete-day/:date", authenticateToken, deleteAllPointsFromUserForDay);
router.delete("/delete/:pointId", authenticateToken, deleteSinglePointFromUser);

export default router;
