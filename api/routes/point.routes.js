import express from "express";
import { createAutoPoint, getDaySummary } from "../controller/point.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", authenticateToken, createAutoPoint);
router.get("/summary/:date?", authenticateToken, getDaySummary);

export default router;
