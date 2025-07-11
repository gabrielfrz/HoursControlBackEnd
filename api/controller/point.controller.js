import { recordPoint, getUserPoints } from "../services/point.service.js";

export const createPoint = async (req, res) => {
  try {
    const { type } = req.body;
    const point = await recordPoint(req.user.id, type);
    res.status(201).json(point);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const listPoints = async (req, res) => {
  try {
    const points = await getUserPoints(req.user.id);
    res.json(points);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
