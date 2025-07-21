import { pool } from "../database/db.js";

// Registrar ponto (usado em geral)
export const recordPoint = async (userId, type, customTimestamp = null) => {
  const result = await pool.query(
    "INSERT INTO points (user_id, type, timestamp) VALUES ($1, $2, $3) RETURNING *",
    [userId, type, customTimestamp || new Date()]
  );
  return result.rows[0];
};

export const getUserPoints = async (userId) => {
  const result = await pool.query(
    "SELECT id, type, timestamp FROM points WHERE user_id = $1 ORDER BY timestamp DESC",
    [userId]
  );
  return result.rows;
};

export const getAllPointsForUser = async (userId) => {
  const result = await pool.query(
    "SELECT id, type, timestamp FROM points WHERE user_id = $1 ORDER BY timestamp ASC",
    [userId]
  );
  return result.rows;
};

export const updatePoint = async (pointId, type, timestamp) => {
  const result = await pool.query(
    "UPDATE points SET type = $1, timestamp = $2 WHERE id = $3 RETURNING *",
    [type, timestamp, pointId]
  );
  return result.rows[0];
};

export const deletePoint = async (pointId) => {
  await pool.query("DELETE FROM points WHERE id = $1", [pointId]);
};

export const getUserPointsByDate = async (userId, date) => {
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      console.warn(`[getUserPointsByDate] Data inválida recebida: ${date}`);
      throw new Error("Data inválida fornecida.");
    }

    const formattedDate = parsedDate.toISOString().slice(0, 10);
    console.log(`[getUserPointsByDate] userId=${userId}, date=${formattedDate}`);

    const result = await pool.query(
      "SELECT * FROM points WHERE user_id = $1 AND DATE(timestamp) = $2 ORDER BY timestamp",
      [userId, formattedDate]
    );

    return result.rows;
  } catch (err) {
    console.error(`[getUserPointsByDate] Erro ao buscar pontos para userId=${userId}, date=${date}`, err);
    throw err;
  }
};

export const getUserTodayPoints = async (userId) => {
  const today = new Date().toISOString().slice(0, 10);
  const result = await pool.query(
    "SELECT * FROM points WHERE user_id = $1 AND DATE(timestamp) = $2 ORDER BY timestamp",
    [userId, today]
  );
  return result.rows;
};

export const registerNextPoint = async (userId, customDate = null) => {
  const now = new Date();

  const dateToUse = customDate
    ? new Date(`${customDate}T${now.toTimeString().split(" ")[0]}`)
    : now;

  const formattedDate = dateToUse.toISOString().slice(0, 10);

  const resultPoints = await pool.query(
    "SELECT * FROM points WHERE user_id = $1 AND DATE(timestamp) = $2 ORDER BY timestamp",
    [userId, formattedDate]
  );

  const points = resultPoints.rows;

  let nextType;
  switch (points.length) {
    case 0:
      nextType = "entrada";
      break;
    case 1:
      nextType = "saida_1";
      break;
    case 2:
      nextType = "retorno";
      break;
    case 3:
      nextType = "saida_final";
      break;
    default:
      throw new Error("Todos os pontos já foram registrados nesse dia.");
  }

  const timestamp = dateToUse.toISOString();

  const result = await pool.query(
    "INSERT INTO points (user_id, type, timestamp) VALUES ($1, $2, $3) RETURNING *",
    [userId, nextType, timestamp]
  );

  return { point: result.rows[0], nextType };
};
