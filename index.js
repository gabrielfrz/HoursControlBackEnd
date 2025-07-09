import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import userRoutes from './routes/user.routes.js';
import pointRoutes from './routes/point.routes.js';
import { connectDB } from './database/db.js';

const app = express();
app.use(express.json());

// Conectar banco
connectDB();

// Rotas
app.use('/api/users', userRoutes);
app.use('/api/points', pointRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;
