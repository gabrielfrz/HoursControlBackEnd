import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user.routes.js';
import pointRoutes from './routes/point.routes.js';
import { connectDB } from './database/db.js';

const app = express();

// ✅ Middleware manual fixo para CORS (resolve preflight no Vercel)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://hours-control-front-end.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Você pode manter o cors também se quiser (opcional)
const allowedOrigins = [
  'https://hours-control-front-end.vercel.app',
  'https://turbo-space-telegram-qr7xgg76pw7hxpjj-3000.app.github.dev',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Conectar ao banco
connectDB();

// Rotas
app.use('/api/users', userRoutes);
app.use('/api/points', pointRoutes);

// Só roda localmente (não no Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

export default app;
