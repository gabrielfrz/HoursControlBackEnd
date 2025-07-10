import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user.routes.js';
import pointRoutes from './routes/point.routes.js';
import { connectDB } from './database/db.js';

const app = express();

// Habilitar CORS para Vercel e Codespaces
app.use(cors({
  origin: [
    'https://hours-control-front-end.vercel.app',
    'https://turbo-space-telegram-qr7xgg76pw7hxpjj-3000.app.github.dev'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // <- adiciona os métodos
}));

// Permitir preflight (OPTIONS)
app.options('*', cors());

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
console.log('Configuração CORS concluída!');


export default app;
