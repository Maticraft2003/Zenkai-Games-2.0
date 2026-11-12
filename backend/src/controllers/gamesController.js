import { all, get, run } from "../../database.js";
import { validateCatalogGame } from "../services/catalogService.js";

const fields = ["nombre", "genero", "etiqueta", "plataforma", "jugadores", "imagen", "descripcion"];

function validate(body = {}) {
  for (const field of ["nombre", "genero", "plataforma", "jugadores", "descripcion"]) {
    if (!String(body[field] ?? "").trim()) {
      const error = new Error(`El campo ${field} es obligatorio.`);
      error.status = 400;
      throw error;
    }
  }

  // RAWG es opcional: el CRUD también debe funcionar sin conexión ni API key.
  if (body.rawg_id !== undefined && body.rawg_id !== null && body.rawg_id !== "") {
    if (!Number.isInteger(Number(body.rawg_id)) || Number(body.rawg_id) <= 0) {
      const error = new Error("El identificador del catálogo no es válido.");
      error.status = 400;
      throw error;
    }
  }
}

async function normalizeGame(body) {
  validate(body);
  const rawgId = body.rawg_id ? Number(body.rawg_id) : null;
  let catalogGame = null;

  if (rawgId) {
    catalogGame = await validateCatalogGame(rawgId, String(body.nombre).trim());
  }

  const values = fields.map((field) => {
    if (field === "imagen") return String(body.imagen || catalogGame?.imagen || "").trim();
    return String(body[field] ?? "").trim();
  });

  return { values, rawgId };
}

export async function listGames(req, res, next) {
  try {
    const juegos = await all(`
      SELECT j.id, j.nombre, j.genero, j.etiqueta, j.plataforma, j.jugadores,
             j.imagen, j.descripcion, j.rawg_id,
             ROUND(COALESCE(AVG(v.puntuacion), 0), 2) AS promedio,
             COUNT(v.id) AS cantidad_votos
      FROM juegos j
      LEFT JOIN valoraciones v ON v.juego_id = j.id
      GROUP BY j.id
      ORDER BY j.nombre COLLATE NOCASE
    `);
    res.json({ success: true, juegos });
  } catch (error) {
    next(error);
  }
}

export async function createGame(req, res, next) {
  try {
    const { values, rawgId } = await normalizeGame(req.body);
    const result = await run(
      "INSERT INTO juegos(nombre,genero,etiqueta,plataforma,jugadores,imagen,descripcion,rawg_id) VALUES(?,?,?,?,?,?,?,?)",
      [...values, rawgId]
    );
    res.status(201).json({ success: true, id: result.lastID, mensaje: "Juego agregado correctamente." });
  } catch (error) {
    next(error);
  }
}

export async function updateGame(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ success: false, mensaje: "El ID del juego no es válido." });
    }

    const existing = await get("SELECT id FROM juegos WHERE id = ?", [id]);
    if (!existing) {
      return res.status(404).json({ success: false, mensaje: "Juego no encontrado." });
    }

    const { values, rawgId } = await normalizeGame(req.body);
    await run(
      "UPDATE juegos SET nombre=?,genero=?,etiqueta=?,plataforma=?,jugadores=?,imagen=?,descripcion=?,rawg_id=? WHERE id=?",
      [...values, rawgId, id]
    );
    res.json({ success: true, mensaje: "Juego actualizado correctamente." });
  } catch (error) {
    next(error);
  }
}

export async function deleteGame(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ success: false, mensaje: "El ID del juego no es válido." });
    }

    const result = await run("DELETE FROM juegos WHERE id = ?", [id]);
    if (!result.changes) {
      return res.status(404).json({ success: false, mensaje: "Juego no encontrado." });
    }
    res.json({ success: true, mensaje: "Juego eliminado correctamente." });
  } catch (error) {
    next(error);
  }
}
