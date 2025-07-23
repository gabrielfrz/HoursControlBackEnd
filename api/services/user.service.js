import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../database/db.js";

// Registrar usuário
export const registerUser = async (name, email, password, role = "estagiario", contractHours = 6) => {
  const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  if (existingUser.rows.length > 0) {
    throw new Error("Usuário já existe com este email");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    "INSERT INTO users (name, email, password, role, contract_hours_per_day) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [name, email, hashedPassword, role, contractHours]
  );

  return result.rows[0];
};

// Login
export const loginUser = async (email, password) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  const user = result.rows[0];

  if (!user) throw new Error("Usuário não encontrado");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Senha incorreta");

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      contractHours: user.contract_hours_per_day
    }
  };
};

// Buscar todos os usuários (admin)
export const getAllUsersWithPoints = async () => {
  const result = await pool.query(
    "SELECT id, name, email, role, contract_hours_per_day FROM users ORDER BY id"
  );
  return result.rows;
};

// Atualizar dados do usuário
export const updateUserData = async (id, data) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (data.name) {
    fields.push(`name = $${index++}`);
    values.push(data.name);
  }

  if (data.email) {
    const emailCheck = await pool.query(
      "SELECT id FROM users WHERE email = $1 AND id != $2",
      [data.email, id]
    );
    if (emailCheck.rows.length > 0) {
      throw new Error("Este email já está em uso por outro usuário");
    }

    fields.push(`email = $${index++}`);
    values.push(data.email);
  }

  if (data.password) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    fields.push(`password = $${index++}`);
    values.push(hashedPassword);
  }

  if (data.contractHours) {
    fields.push(`contract_hours_per_day = $${index++}`);
    values.push(data.contractHours);
  }

  if (fields.length === 0) {
    throw new Error("Nenhum dado para atualizar");
  }

  values.push(id);
  const query = `UPDATE users SET ${fields.join(", ")} WHERE id = $${index} RETURNING id, name, email, role, contract_hours_per_day`;

  const result = await pool.query(query, values);
  return result.rows[0];
};
