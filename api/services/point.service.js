import { pool } from '../database/db.js';

export const recordPoint = async (userId, type) => {
  const result = await pool.query(
    'INSERT INTO points (user_id, type) VALUES ($1, $2) RETURNING *',
    [userId, type]
  );
  return result.rows[0];
};

export const getUserPoints = async (userId) => {
  const result = await pool.query(
    'SELECT * FROM points WHERE user_id = $1 ORDER BY timestamp DESC',
    [userId]
  );
  return result.rows;
};
