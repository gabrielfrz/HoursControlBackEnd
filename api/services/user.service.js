import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../database/db.js';

export const registerUser = async (name, email, password, role = 'estagiario') => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, email, hashedPassword, role]
  );
  return result.rows[0];
};

export const loginUser = async (email, password) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user) throw new Error('Usuário não encontrado');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Senha incorreta');

  // Inclui role no token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
  return { token, user };
};

export const getAllUsersWithPoints = async () => {
  const result = await pool.query(`
    SELECT u.id, u.name, u.email, u.role, p.id as point_id, p.type, p.timestamp
    FROM users u
    LEFT JOIN points p ON p.user_id = u.id
    ORDER BY u.id, p.timestamp DESC
  `);
  return result.rows;
};
