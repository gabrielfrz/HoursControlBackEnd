import express from 'express';
import { createPoint, listPoints } from '../controller/point.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authenticateToken, createPoint);
router.get('/', authenticateToken, listPoints);

export default router;
