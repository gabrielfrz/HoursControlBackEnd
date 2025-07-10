import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user.routes.js';
import pointRoutes from './routes/point.routes.js';
import { connectDB } from './database/db.js';

const app = express();

const allowedOrigins = [
  'https://hours-control-front-end.vercel.app',
  'https://turbo-space-telegram-qr7xgg76pw7hxpjj-3000.app.github.dev'
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


app.options('*', cors(corsOptions));

app.use(express.json());

connectDB();

app.use('/api/users', userRoutes);
app.use('/api/points', pointRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;
