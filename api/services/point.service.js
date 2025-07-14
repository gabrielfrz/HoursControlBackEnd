import { pool } from "../database/db.js";

// Criar ponto
export const recordPoint = async (userId, type) => {
  const result = await pool.query(
    "INSERT INTO points (user_id, type, timestamp) VALUES ($1, $2, NOW()) RETURNING *",
    [userId, type]
  );
  return result.rows[0];
};

// Buscar pontos por usuário
export const getUserPoints = async (userId) => {
  const result = await pool.query(
    "SELECT id, type, timestamp FROM points WHERE user_id = $1 ORDER BY timestamp DESC",
    [userId]
  );
  return result.rows;
};
