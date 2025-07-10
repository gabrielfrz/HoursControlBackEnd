import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user.routes.js';
import pointRoutes from './routes/point.routes.js';
import { connectDB } from './database/db.js';

const app = express();

// Configuração CORS correta
const allowedOrigins = [
  'https://hours-control-front-end.vercel.app',
  'https://turbo-space-telegram-qr7xgg76pw7hxpjj-3000.app.github.dev'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());

connectDB();

app.use('/api/users', userRoutes);
app.use('/api/points', pointRoutes);

const PORT = process.env.PORT || 3000;

// Para rodar local
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

// Para Vercel (exporta o app)
export default app;
