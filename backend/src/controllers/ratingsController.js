import { get, run } from "../../database.js";

export async function rateGame(req, res, next) {
  try {
    const gameId = Number(req.params.gameId);
    const userId = Number(req.usuario?.id);
    const score = Number(req.body?.puntuacion);

    if (!Number.isInteger(gameId) || gameId < 1) {
      return res.status(400).json({ success: false, mensaje: "El juego indicado no es válido." });
    }
    if (!Number.isInteger(userId) || userId < 1) {
      return res.status(401).json({ success: false, mensaje: "Iniciá sesión para valorar." });
    }
    if (!Number.isInteger(score) || score < 1 || score > 5) {
      return res.status(400).json({ success: false, mensaje: "Elegí una valoración de 1 a 5 estrellas." });
    }

    const game = await get("SELECT id FROM juegos WHERE id = ?", [gameId]);
    if (!game) {
      return res.status(404).json({ success: false, mensaje: "Juego no encontrado." });
    }

    // Una valoración por usuario y juego. Si ya existe, se actualiza.
    await run(`
      INSERT INTO valoraciones(usuario_id, juego_id, puntuacion)
      VALUES (?, ?, ?)
      ON CONFLICT(usuario_id, juego_id)
      DO UPDATE SET puntuacion = excluded.puntuacion, updated_at = CURRENT_TIMESTAMP
    `, [userId, gameId, score]);

    const rating = await get(`
      SELECT ROUND(AVG(puntuacion), 2) AS promedio, COUNT(*) AS cantidad_votos
      FROM valoraciones
      WHERE juego_id = ?
    `, [gameId]);

    return res.json({
      success: true,
      puntuacion: score,
      promedio: Number(rating?.promedio ?? 0),
      cantidad_votos: Number(rating?.cantidad_votos ?? 0),
      mensaje: "Tu valoración quedó guardada."
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyRating(req, res, next) {
  try {
    const gameId = Number(req.params.gameId);
    if (!Number.isInteger(gameId) || gameId < 1) {
      return res.status(400).json({ success: false, mensaje: "El ID del juego no es válido." });
    }

    const row = await get(
      "SELECT puntuacion FROM valoraciones WHERE usuario_id = ? AND juego_id = ?",
      [req.usuario.id, gameId]
    );
    return res.json({ success: true, puntuacion: row?.puntuacion ?? null });
  } catch (error) {
    next(error);
  }
}
