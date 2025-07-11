if (process.env.NODE_ENV !== 'production') {
  const dotenv = await import('dotenv');
  dotenv.config();
}

import express from "express";
import cors from "cors";
import userRoutes from "./api/routes/user.routes.js";
import pointRoutes from "./api/routes/point.routes.js";

const app = express();

const allowedOrigins = [
  "https://hours-control-front-end.vercel.app",
  "https://turbo-space-telegram-qr7xgg76pw7hxpjj-3000.app.github.dev",
  "http://localhost:3001", 
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Origem não permitida pelo CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api", userRoutes);
app.use("/api", pointRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Backend online! 🚀🔥" });
});



if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando localmente na porta ${PORT}`);
  });
}


export default app;
