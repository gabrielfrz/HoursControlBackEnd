import {
  recordPoint,
  getUserPoints,
  getAllPointsForUser,
  updatePoint,
  deletePoint,
  registerNextPoint,
  getUserPointsByDate,
} from "../services/point.service.js";
import { pool } from "../database/db.js";

// Registrar próximo ponto automático
export const createAutoPoint = async (req, res) => {
  try {
    let customDate = null;

    if (req.body.date) {
      customDate = new Date(req.body.date);

      if (isNaN(customDate.getTime())) {
        return res.status(400).json({ message: "Data inválida." });
      }

      const today = new Date();
      if (customDate > today) {
        return res.status(400).json({ message: "Não é permitido registrar em datas futuras." });
      }
    }

    const { point, nextType } = await registerNextPoint(req.userId, customDate);
    res.status(201).json({ point, message: `Ponto ${point.type} registrado. Próximo: ${nextType || 'nenhum'}` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Resumo diário com cálculo de horas
export const getDaySummary = async (req, res) => {
  try {
    const rawDate = req.params.date || new Date().toISOString().slice(0, 10);
    const localDate = new Date(rawDate);
    localDate.setUTCHours(0, 0, 0, 0); 
    const formattedDate = localDate.toISOString().split('T')[0];

    const points = await getUserPointsByDate(req.userId, formattedDate);

    if (points.length < 2) {
      return res.json({
        date: formattedDate,
        points,
        totalHours: 0,
        contractHours: 0,
        difference: 0,
        message: "Poucos registros para calcular.",
        isComplete: false
      });
    }

    let total = 0;
    for (let i = 0; i < points.length - 1; i += 2) {
      const start = new Date(points[i].timestamp);
      const end = new Date(points[i + 1].timestamp);
      total += (end - start) / 1000 / 60 / 60; // horas
    }

    const userData = await pool.query(
      "SELECT contract_hours_per_day FROM users WHERE id = $1",
      [req.userId]
    );

    if (!userData.rows[0]) {
      return res.status(404).json({ message: "Usuário não encontrado para gerar resumo." });
    }

    const contractHours = userData.rows[0].contract_hours_per_day || 6;
    const isComplete = total >= contractHours;

    res.json({
      date: formattedDate,
      points,
      totalHours: total.toFixed(2),
      contractHours,
      difference: (total - contractHours).toFixed(2),
      isComplete,
      message: isComplete
        ? "Meta diária atingida ou horas extras."
        : "Horas abaixo da meta, possível compensar.",
    });
  } catch (error) {
    res.status(400).json({ message: error.message || "Erro ao gerar resumo." });
  }
};


// Histórico completo (admin)
export const listAllPointsByAdmin = async (req, res) => {
  try {
    if (req.user.role !== "adm") {
      return res.status(403).json({ message: "Apenas administradores têm acesso." });
    }

    const { userId } = req.params;
    const points = await getAllPointsForUser(userId);
    res.json(points);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Editar ponto (admin)
export const editPointByAdmin = async (req, res) => {
  try {
    if (req.user.role !== "adm") {
      return res.status(403).json({ message: "Apenas administradores têm acesso." });
    }

    const { pointId } = req.params;
    const { type, timestamp } = req.body;
    const updatedPoint = await updatePoint(pointId, type, timestamp);
    res.json(updatedPoint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Criar ponto manual (admin)
export const createPointByAdmin = async (req, res) => {
  try {
    if (req.user.role !== "adm") {
      return res.status(403).json({ message: "Apenas administradores têm acesso." });
    }

    const { userId, type, timestamp } = req.body;
    const point = await recordPoint(userId, type, timestamp);
    res.status(201).json(point);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Excluir ponto individual (usuário)
export const deleteSinglePointFromUser = async (req, res) => {
  try {
    const { pointId } = req.params;
    const result = await pool.query(
      "DELETE FROM points WHERE id = $1 AND user_id = $2 RETURNING *",
      [pointId, req.userId]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ message: "Você não tem permissão para excluir esse ponto." });
    }

    res.json({ message: "Ponto excluído com sucesso." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Excluir todos os pontos de um dia (usuário)
export const deleteAllPointsFromUserForDay = async (req, res) => {
  try {
    const { date } = req.params;
    const result = await pool.query(
      "DELETE FROM points WHERE user_id = $1 AND DATE(timestamp) = $2 RETURNING *",
      [req.userId, date]
    );
    res.json({ message: `Apagados ${result.rowCount} pontos do dia ${date}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const editOwnPoint = async (req, res) => {
  try {
    const { pointId } = req.params;
    const { timestamp } = req.body;

    if (!timestamp || isNaN(new Date(timestamp).getTime())) {
      return res.status(400).json({ message: "Timestamp inválido." });
    }

  // Timestamp já chega em UTC do frontend, apenas usa diretamente
    const utcTimestamp = new Date(timestamp).toISOString();

    const result = await pool.query(
      "UPDATE points SET timestamp = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
      [utcTimestamp, pointId, req.userId]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ message: "Você não tem permissão para editar este ponto." });
    }

    res.json({ message: "Ponto atualizado com sucesso.", point: result.rows[0] });
  } catch (error) {
    console.error("Erro ao editar ponto:", error);
    res.status(500).json({ message: "Erro ao editar ponto." });
  }
}
