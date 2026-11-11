import { normalizarClaveJuego, TITULOS_JUEGOS_PERMITIDOS } from "../../gameKeys.js";

export function crearControladorCalificaciones({ db }) {
    const responderCalificacion = (res, juegoKey, usuarioId) => {
        db.get(
            `SELECT COUNT(*) AS cantidad_calificaciones,
                    AVG(puntuacion) AS puntuacion_comunidad,
                    COALESCE(MAX(CASE WHEN usuario_id = ? THEN puntuacion END), 0) AS puntuacion_usuario
             FROM juegos_calificaciones
             WHERE juego_key = ?`,
            [usuarioId, juegoKey],
            (error, calificacion) => {
                if (error) {
                    return res.status(500).json({
                        success: false,
                        mensaje: "No se pudo consultar la puntuación del juego."
                    });
                }

                return res.json({ success: true, calificacion });
            }
        );
    };

    const obtenerCalificacion = (req, res) => {
        const juegoKey = normalizarClaveJuego(req.params.gameKey || "");
        if (!juegoKey) {
            return res.status(400).json({ success: false, mensaje: "El juego no es válido." });
        }

        return responderCalificacion(res, juegoKey, req.usuarioId || 0);
    };

    const guardarCalificacion = (req, res) => {
        const juegoKey = normalizarClaveJuego(req.params.gameKey || "");
        const puntuacion = Number(req.body?.puntuacion);
        const usuarioId = req.usuarioId;

        if (!juegoKey || !Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
            return res.status(400).json({
                success: false,
                mensaje: "La puntuación debe ser un número entero entre 1 y 5 estrellas."
            });
        }

        const guardar = () => db.run(
            `INSERT INTO juegos_calificaciones(juego_key, usuario_id, puntuacion)
             VALUES(?, ?, ?)
             ON CONFLICT(juego_key, usuario_id) DO UPDATE SET
                puntuacion = excluded.puntuacion,
                updated_at = CURRENT_TIMESTAMP`,
            [juegoKey, usuarioId, puntuacion],
            (error) => {
                if (error) {
                    return res.status(500).json({
                        success: false,
                        mensaje: "No se pudo guardar tu puntuación."
                    });
                }

                return responderCalificacion(res, juegoKey, usuarioId);
            }
        );

        if (TITULOS_JUEGOS_PERMITIDOS.has(juegoKey)) {
            return guardar();
        }

        db.get(
            "SELECT id FROM juegos WHERE nombre_key = ?",
            [juegoKey],
            (error, juego) => {
                if (error) {
                    return res.status(500).json({
                        success: false,
                        mensaje: "No se pudo verificar el juego."
                    });
                }
                if (!juego) {
                    return res.status(404).json({
                        success: false,
                        mensaje: "No se puede puntuar un juego que no existe en el catálogo."
                    });
                }
                return guardar();
            }
        );
    };

    return { obtenerCalificacion, guardarCalificacion };
}