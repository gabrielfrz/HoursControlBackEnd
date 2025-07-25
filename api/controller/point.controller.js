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
      // Interpreta corretamente como data local para evitar UTC
      const [year, month, day] = req.body.date.split('-').map(Number);
      customDate = new Date(year, month - 1, day, 12, 0, 0);

      if (isNaN(customDate.getTime())) {
        return res.status(400).json({ message: "Data inválida." });
      }

      // Comparar apenas datas (ignorando hora) para evitar falsos positivos
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const customDateOnly = new Date(customDate);
      customDateOnly.setHours(0, 0, 0, 0);

      if (customDateOnly > now) {
        return res.status(400).json({ message: "Não é permitido registrar em datas futuras." });
      }
    }

    const { point, nextType } = await registerNextPoint(req.userId, customDate);
    res.status(201).json({
      point,
      message: `Ponto ${point.type} registrado. Próximo: ${nextType || 'nenhum'}`,
    });
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


export const getMonthSummary = async (req, res) => {
  try {
    const { year, month } = req.params;
    const userId = req.userId;

    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // Pega pontos do mês
    const pointsQuery = await pool.query(
      `SELECT id, timestamp, type
       FROM points
       WHERE user_id = $1 AND timestamp >= $2 AND timestamp < $3
       ORDER BY timestamp ASC`,
      [userId, startDate.toISOString(), endDate.toISOString()]
    );
    const points = pointsQuery.rows;

    // Pega exceções (feriado ou folga)
    const exceptionsQuery = await pool.query(
      `SELECT date, type FROM day_exceptions
       WHERE user_id = $1 AND date >= $2 AND date < $3`,
      [userId, startDate.toISOString(), endDate.toISOString()]
    );
    const exceptionsMap = {};
    for (const e of exceptionsQuery.rows) {
      const dateIso = e.date.toISOString().slice(0, 10);
      exceptionsMap[dateIso] = e.type; // 'feriado' ou 'folga'
    }

    // Agrupa pontos por dia
    const dailyMap = {};
    for (const point of points) {
      const day = new Date(point.timestamp).toISOString().slice(0, 10);
      if (!dailyMap[day]) dailyMap[day] = [];
      dailyMap[day].push(point);
    }

    // Inicializações
    const contractPerDay = 6; // horas por dia
    const allDays = [];
    let expectedHours = 0;
    let actualWorked = 0;
    let folgaDeduzida = 0;

    // Geração do resumo por dia
    const current = new Date(startDate);
    while (current < endDate) {
      const iso = current.toISOString().slice(0, 10);
      const isWeekend = [0, 6].includes(current.getDay());
      const exceptionType = exceptionsMap[iso] || null;

      let totalDay = 0;
      const dailyPoints = dailyMap[iso] || [];
      for (let i = 0; i < dailyPoints.length - 1; i += 2) {
        const start = new Date(dailyPoints[i].timestamp);
        const end = new Date(dailyPoints[i + 1].timestamp);
        totalDay += (end - start) / 1000 / 60 / 60;
      }
      totalDay = Number(totalDay.toFixed(2));
      actualWorked += totalDay;

      if (!isWeekend) {
        if (exceptionType === 'folga') {
          expectedHours += contractPerDay;
          folgaDeduzida += contractPerDay;
        } else if (exceptionType !== 'feriado') {
          expectedHours += contractPerDay;
        }
      }

      allDays.push({
        date: iso,
        hours: totalDay,
        isWeekend,
        isException: !!exceptionType,
        exceptionType: exceptionType || null,
      });

      current.setDate(current.getDate() + 1);
    }

    const bancoHoras = actualWorked - expectedHours + folgaDeduzida;

    res.json({
      year,
      month,
      expectedHours: Number(expectedHours.toFixed(2)),
      actualWorked: Number(actualWorked.toFixed(2)),
      bancoHoras: Number(bancoHoras.toFixed(2)),
      days: allDays,
    });
  } catch (err) {
    console.error('Erro ao calcular resumo mensal:', err);
    res.status(500).json({ message: 'Erro ao calcular resumo mensal.' });
  }
};

export const setException = async (req, res) => {
  try {
    const userId = req.userId;
    const { date, type } = req.body;

    if (!date || !['feriado', 'folga', ''].includes(type)) {
      return res.status(400).json({ message: 'Dados inválidos.' });
    }

    const existing = await pool.query(
      'SELECT * FROM day_exceptions WHERE user_id = $1 AND date = $2',
      [userId, date]
    );

    if (type === '') {
      // Remover exceção existente, se houver
      if (existing.rowCount > 0) {
        await pool.query('DELETE FROM day_exceptions WHERE user_id = $1 AND date = $2', [userId, date]);
      }
    } else {
      if (existing.rowCount > 0) {
        await pool.query(
          'UPDATE day_exceptions SET type = $1 WHERE user_id = $2 AND date = $3',
          [type, userId, date]
        );
      } else {
        await pool.query(
          'INSERT INTO day_exceptions (user_id, date, type) VALUES ($1, $2, $3)',
          [userId, date, type]
        );
      }
    }

    res.status(200).json({ message: 'Exceção atualizada.' });
  } catch (err) {
    console.error('Erro ao atualizar exceção:', err);
    res.status(500).json({ message: 'Erro ao atualizar exceção.' });
  }
};
