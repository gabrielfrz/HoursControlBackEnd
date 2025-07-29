import express from "express";
import {
  createAutoPoint,
  getDaySummary,
  deleteAllPointsFromUserForDay,
  deleteSinglePointFromUser,
  editOwnPoint,
  getMonthSummary,
  setException,
  getMonthSummaryByAdmin
} from "../controller/point.controller.js";

import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", authenticateToken, createAutoPoint);
router.get("/summary/:date?", authenticateToken, getDaySummary);
router.delete("/delete-day/:date", authenticateToken, deleteAllPointsFromUserForDay);
router.delete("/delete/:pointId", authenticateToken, deleteSinglePointFromUser);
router.put("/edit/:pointId", authenticateToken, editOwnPoint);
router.get("/month-summary/:year/:month", authenticateToken, getMonthSummary);
router.post("/set-exception", authenticateToken, setException);
router.get("/month-summary/:userId/:year/:month", authenticateToken, getMonthSummaryByAdmin);

export default router;
