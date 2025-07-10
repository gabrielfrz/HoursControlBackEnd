import express from 'express';
import { register, login, getAllUsers } from '../controller/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/all', authenticateToken, getAllUsers);

export default router;
