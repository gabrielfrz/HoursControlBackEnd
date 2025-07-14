import { recordPoint, getUserPoints } from "../services/point.service.js";

// Criar ponto (usuário autenticado)
export const createPoint = async (req, res) => {
  try {
    const { type } = req.body;
    const point = await recordPoint(req.user.id, type);
    res.status(201).json(point);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Listar pontos do próprio usuário
export const listPoints = async (req, res) => {
  try {
    const points = await getUserPoints(req.user.id);
    res.json(points);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Listar pontos de qualquer usuário (admin)
export const listPointsByAdmin = async (req, res) => {
  try {
    if (req.user.role !== "adm") {
      return res
        .status(403)
        .json({ message: "Acesso negado: apenas ADM pode acessar" });
    }

    const { userId } = req.params;
    const points = await getUserPoints(userId);
    res.json(points);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
