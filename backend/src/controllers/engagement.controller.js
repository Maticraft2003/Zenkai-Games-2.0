import { normalizarClaveJuego, TITULOS_JUEGOS_PERMITIDOS } from "../../gameKeys.js";

const CONSULTA_RANKINGS_JUEGOS = `
    WITH juegos_catalogo AS (
        SELECT juegos.id, juegos.nombre, juegos.genero, juegos.puntuacion,
               juegos.plataforma, juegos.etiqueta, juegos.imagen, juegos.descripcion,
               juegos.catalog_key, juegos.nombre_key, juegos.created_at
        FROM juegos
        UNION ALL
        SELECT NULL AS id, visitas.nombre, visitas.genero, NULL AS puntuacion,
               NULL AS plataforma, NULL AS etiqueta, visitas.imagen, visitas.descripcion,
               NULL AS catalog_key, visitas.juego_key AS nombre_key,
               '1970-01-01 00:00:00' AS created_at
        FROM juegos_visitas AS visitas
        WHERE NOT EXISTS (
            SELECT 1 FROM juegos WHERE juegos.nombre_key = visitas.juego_key
        )
    ),
    juegos_con_puntuacion AS (
        SELECT juegos_catalogo.id, juegos_catalogo.nombre, juegos_catalogo.genero,
               juegos_catalogo.puntuacion, juegos_catalogo.plataforma,
               juegos_catalogo.etiqueta, juegos_catalogo.imagen, juegos_catalogo.descripcion,
               juegos_catalogo.catalog_key, juegos_catalogo.created_at,
               COALESCE(visitas.visitas, 0) AS visitas,
               COALESCE(likes.likes, 0) AS likes,
               COALESCE(dislikes.dislikes, 0) AS dislikes,
               ROUND(
                   10.0 * COALESCE(likes.likes, 0)
                   / NULLIF(COALESCE(likes.likes, 0) + COALESCE(dislikes.dislikes, 0), 0),
                   1
               ) AS puntuacion_comunidad,
               COALESCE(visitas.visitas, 0) + 2 * COALESCE(likes.likes, 0) AS popularidad
        FROM juegos_catalogo
        LEFT JOIN juegos_visitas AS visitas ON visitas.juego_key = juegos_catalogo.nombre_key
        LEFT JOIN (
            SELECT juego_key, COUNT(*) AS likes FROM juegos_likes GROUP BY juego_key
        ) AS likes ON likes.juego_key = juegos_catalogo.nombre_key
        LEFT JOIN (
            SELECT juego_key, COUNT(*) AS dislikes FROM juegos_dislikes GROUP BY juego_key
        ) AS dislikes ON dislikes.juego_key = juegos_catalogo.nombre_key
    ),
    juegos_por_genero AS (
        SELECT *,
               ROW_NUMBER() OVER (
                   PARTITION BY LOWER(TRIM(genero))
                   ORDER BY puntuacion_comunidad DESC,
                            likes + dislikes DESC,
                            visitas DESC,
                            nombre COLLATE NOCASE ASC
               ) AS posicion
        FROM juegos_con_puntuacion
        WHERE likes + dislikes > 0
    )
    SELECT id, nombre, genero, puntuacion, plataforma, etiqueta, imagen,
           descripcion, catalog_key, created_at, visitas, likes, dislikes,
           puntuacion_comunidad, popularidad
    FROM juegos_por_genero
    WHERE posicion = 1
    ORDER BY genero COLLATE NOCASE ASC
`;

export function crearControladorEngagement({ db }) {
    const obtenerRecomendados = (req, res) => {
        db.all(
            `SELECT visitas.juego_key, visitas.nombre, visitas.genero, visitas.imagen,
                    visitas.descripcion, visitas.visitas,
                    COALESCE(calificaciones.cantidad, 0) AS cantidad_calificaciones,
                    calificaciones.promedio AS puntuacion_comunidad,
                    visitas.visitas + 2 * COALESCE(calificaciones.cantidad, 0) AS popularidad,
                    visitas.visitas + 2 * COALESCE(calificaciones.cantidad, 0) AS interes_total
             FROM juegos_visitas AS visitas
             LEFT JOIN (
                 SELECT juego_key, COUNT(*) AS cantidad, AVG(puntuacion) AS promedio
                 FROM juegos_calificaciones
                 GROUP BY juego_key
             ) AS calificaciones ON calificaciones.juego_key = visitas.juego_key
             WHERE visitas.visitas > 0
                OR COALESCE(calificaciones.cantidad, 0) > 0
             ORDER BY puntuacion_comunidad IS NULL ASC, puntuacion_comunidad DESC,
                      cantidad_calificaciones DESC, popularidad DESC, visitas.visitas DESC,
                      visitas.nombre COLLATE NOCASE ASC, visitas.juego_key ASC
             LIMIT 6`,
            (err, juegos) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        mensaje: "No se pudieron cargar las recomendaciones."
                    });
                }

                return res.json({ success: true, juegos });
            }
        );
    };

    const obtenerRankings = (req, res) => {
        db.all(
            `WITH juegos_catalogo AS (
                 SELECT id, nombre, genero, puntuacion, plataforma, plataformas, jugadores,
                        rawg_id, etiqueta, imagen, descripcion, catalog_key, nombre_key, created_at
                 FROM juegos
                 UNION ALL
                 SELECT NULL, visitas.nombre, visitas.genero, NULL, NULL, NULL, NULL,
                        NULL, NULL, visitas.imagen, visitas.descripcion, NULL, visitas.juego_key,
                        '1970-01-01 00:00:00'
                 FROM juegos_visitas AS visitas
                 WHERE NOT EXISTS (
                     SELECT 1 FROM juegos WHERE juegos.nombre_key = visitas.juego_key
                 )
             ),
             juegos_calificados AS (
                 SELECT juegos_catalogo.*,
                        COALESCE(visitas.visitas, 0) AS visitas,
                        COALESCE(calificaciones.cantidad, 0) AS cantidad_calificaciones,
                        calificaciones.promedio AS puntuacion_comunidad,
                        COALESCE(visitas.visitas, 0) + 2 * COALESCE(calificaciones.cantidad, 0) AS popularidad
                 FROM juegos_catalogo
                 LEFT JOIN juegos_visitas AS visitas ON visitas.juego_key = juegos_catalogo.nombre_key
                 LEFT JOIN (
                     SELECT juego_key, COUNT(*) AS cantidad, AVG(puntuacion) AS promedio
                     FROM juegos_calificaciones
                     GROUP BY juego_key
                 ) AS calificaciones ON calificaciones.juego_key = juegos_catalogo.nombre_key
             ),
             juegos_por_genero AS (
                 SELECT *,
                        ROW_NUMBER() OVER (
                            PARTITION BY LOWER(TRIM(genero))
                            ORDER BY puntuacion_comunidad DESC, cantidad_calificaciones DESC,
                                     visitas DESC, nombre COLLATE NOCASE ASC
                        ) AS posicion
                 FROM juegos_calificados
                 WHERE cantidad_calificaciones > 0
             )
             SELECT * FROM juegos_por_genero
             WHERE posicion = 1
             ORDER BY genero COLLATE NOCASE ASC`,
            (err, juegos) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    mensaje: "No se pudieron cargar los rankings."
                });
            }

            return res.json({ success: true, juegos });
            }
        );
    };

    const obtenerEstadisticasJuego = (req, res) => {
        const gameKey = normalizarClaveJuego(req.params.gameKey || "");
        const usuarioId = req.usuarioId || 0;

        if (!gameKey) {
            return res.status(400).json({ success: false, mensaje: "El juego no es válido." });
        }

        db.get(
            `WITH calificaciones AS (
                 SELECT COUNT(*) AS cantidad_calificaciones, AVG(puntuacion) AS puntuacion_comunidad
                 FROM juegos_calificaciones
                 WHERE juego_key = ?
             )
             SELECT ? AS juego_key,
                    (SELECT nombre FROM juegos_visitas WHERE juego_key = ?) AS nombre,
                    (SELECT genero FROM juegos_visitas WHERE juego_key = ?) AS genero,
                    (SELECT imagen FROM juegos_visitas WHERE juego_key = ?) AS imagen,
                    (SELECT descripcion FROM juegos_visitas WHERE juego_key = ?) AS descripcion,
                    COALESCE((SELECT visitas FROM juegos_visitas WHERE juego_key = ?), 0) AS visitas,
                    votos.likes,
                    votos.dislikes,
                    CASE
                        WHEN votos.likes + votos.dislikes = 0 THEN NULL
                        ELSE ROUND(10.0 * votos.likes / (votos.likes + votos.dislikes), 1)
                    END AS puntuacion_comunidad,
                    COALESCE((SELECT visitas FROM juegos_visitas WHERE juego_key = ?), 0)
                        + 2 * votos.likes AS popularidad,
                    EXISTS(
                        SELECT 1 FROM juegos_likes
                        WHERE juego_key = ? AND usuario_id = ?
                    ) AS liked_by_user,
                    EXISTS(
                        SELECT 1 FROM juegos_dislikes
                        WHERE juego_key = ? AND usuario_id = ?
                    ) AS disliked_by_user
                    calificaciones.cantidad_calificaciones,
                    calificaciones.puntuacion_comunidad,
                    COALESCE((SELECT puntuacion FROM juegos_calificaciones
                              WHERE juego_key = ? AND usuario_id = ?), 0) AS puntuacion_usuario,
                gameKey,
                        + 2 * calificaciones.cantidad_calificaciones AS popularidad
             FROM calificaciones`,
                if (err) {
                    return res.status(500).json({
                        mensaje: "No se pudieron cargar las estadísticas del juego."
                    });
                }

                return res.json({ success: true, juego });
            }
        );
                Number.isInteger(usuarioId) && usuarioId > 0 ? usuarioId : 0,
    };
        const juegoRecibido = req.body?.juego || {};
        const usuarioIdValido = req.usuarioId || 0;
        const sessionId = typeof req.body?.sessionId === "string" ? req.body.sessionId.trim() : "";
        const visitanteKey = usuarioIdValido
            ? `usuario:${usuarioIdValido}`
            : /^[A-Za-z0-9._:-]{8,128}$/.test(sessionId)
                ? `sesion:${sessionId}`
                : null;

        if (!visitanteKey) {
            return res.status(400).json({
                success: false,
                mensaje: "No se pudo identificar esta visita. Actualizá la página e intentá nuevamente.",
            });
        }

        if (!nombre || !gameKey || normalizarClaveJuego(nombre) !== gameKey) {
            return res.status(400).json({ success: false, mensaje: "No se pudo identificar el juego." });
        }

        db.get(
            "SELECT nombre, genero, imagen, descripcion FROM juegos WHERE nombre_key = ? ORDER BY id ASC LIMIT 1",
            [gameKey],
            (gameError, juegoGuardado) => {
                if (gameError) {
                    return res.status(500).json({ success: false, mensaje: "No se pudo cargar el juego." });
                }

                if (!juegoGuardado && !TITULOS_JUEGOS_PERMITIDOS.has(gameKey)) {
                    return res.status(404).json({
                        success: false,
                        mensaje: "Este juego no existe o ya no está disponible en Zenkai Games.",
                        code: "GAME_NOT_FOUND",
                    });
                }

                const tieneDescripcionPropia = Boolean(juegoGuardado);
                const juego = juegoGuardado || {
                    nombre,
                    genero: typeof juegoRecibido.genero === "string" ? juegoRecibido.genero.trim() : "",
                    imagen: typeof juegoRecibido.imagen === "string" ? juegoRecibido.imagen.trim() : "",
                    descripcion: typeof juegoRecibido.descripcion === "string" ? juegoRecibido.descripcion.trim() : "",
                };

                db.run(
                    `INSERT INTO juegos_visitas(juego_key, nombre, genero, imagen, descripcion, visitas)
                     VALUES(?, ?, ?, ?, ?, 0)
                     ON CONFLICT(juego_key) DO UPDATE SET
                        nombre = excluded.nombre,
                        genero = excluded.genero,
                        imagen = excluded.imagen,
                        descripcion = CASE WHEN ? = 1 THEN excluded.descripcion ELSE juegos_visitas.descripcion END`,
                    [gameKey, juego.nombre, juego.genero || "", juego.imagen || "", juego.descripcion || "", tieneDescripcionPropia ? 1 : 0],
                    (metadataError) => {
                        if (metadataError) {
                            return res.status(500).json({
                                success: false,
                                mensaje: "No se pudo registrar la visita."
                            });
                        }

                        const cargarEstadisticas = (visitaContada) => {
                            db.get(
                                `WITH votos AS (
                                     SELECT
                                         (SELECT COUNT(*) FROM juegos_likes WHERE juego_key = ?) AS likes,
                                         (SELECT COUNT(*) FROM juegos_dislikes WHERE juego_key = ?) AS dislikes
                                 )
                                 SELECT visitas.juego_key, visitas.nombre, visitas.genero, visitas.imagen,
                                        visitas.descripcion, visitas.visitas,
                                        votos.likes, votos.dislikes,
                                        CASE
                                            WHEN votos.likes + votos.dislikes = 0 THEN NULL
                                            ELSE ROUND(10.0 * votos.likes / (votos.likes + votos.dislikes), 1)
                                        END AS puntuacion_comunidad,
                                        visitas.visitas + 2 * votos.likes AS popularidad,
                                        EXISTS(
                                            SELECT 1 FROM juegos_likes
                                            WHERE juego_key = visitas.juego_key AND usuario_id = ?
                                        ) AS liked_by_user,
                                        EXISTS(
                                            SELECT 1 FROM juegos_dislikes
                                            WHERE juego_key = visitas.juego_key AND usuario_id = ?
                                        ) AS disliked_by_user
                                 FROM juegos_visitas AS visitas
                                 CROSS JOIN votos
                                 WHERE visitas.juego_key = ?`,
                                [gameKey, gameKey, usuarioIdValido, usuarioIdValido, gameKey],
                                (statsError, resultado) => {
                                    if (statsError) {
                                        return res.status(500).json({
                                            success: false,
                                            mensaje: "La visita se registró, pero no se pudieron cargar las estadísticas."
                                        });
                                    }
                                    resultado.view_counted = visitaContada;
                                    return res.json({ success: true, juego: resultado });
                                }
                            );
                        };

                        db.run(
                            "INSERT OR IGNORE INTO juegos_visitas_unicas(juego_key, visitante_key) VALUES(?, ?)",
                            [gameKey, visitanteKey],
                            function (visitorError) {
                                if (visitorError) {
                                    return res.status(500).json({
                                        success: false,
                                        mensaje: "No se pudo registrar la visita."
                                    });
                                }

                                if (!this.changes) {
                                    return cargarEstadisticas(false);
                                }

                                db.run(
                                    "UPDATE juegos_visitas SET visitas = visitas + 1 WHERE juego_key = ?",
                                    [gameKey],
                                    (countError) => {
                                        if (countError) {
                                            return res.status(500).json({
                                                success: false,
                                                mensaje: "No se pudo actualizar el contador de visitas."
                                            });
                                        }
                                        return cargarEstadisticas(true);
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    };

    const actualizarVotoJuego = (req, res, tipoVoto, quitarVoto = false) => {
        const gameKey = normalizarClaveJuego(req.params.gameKey || "");
        const usuarioId = req.usuarioId;
        const tablaVoto = tipoVoto === "like" ? "juegos_likes" : "juegos_dislikes";
        const tablaOpuesta = tipoVoto === "like" ? "juegos_dislikes" : "juegos_likes";
        const etiquetaVoto = tipoVoto === "like" ? "me gusta" : "no me gusta";

        if (!gameKey || !Number.isInteger(usuarioId) || usuarioId < 1) {
            return res.status(400).json({ success: false, mensaje: "El juego o la cuenta no son válidos." });
        }

        const registrarVoto = () => db.get(
            "SELECT id FROM usuarios WHERE id = ?",
            [usuarioId],
            (userError, usuario) => {
                if (userError) {
                    return res.status(500).json({ success: false, mensaje: "No se pudo verificar la cuenta." });
                }
                if (!usuario) {
                    return res.status(404).json({ success: false, mensaje: "No se encontró la cuenta." });
                }

                if (quitarVoto) {
                    return db.run(
                        `DELETE FROM ${tablaVoto} WHERE juego_key = ? AND usuario_id = ?`,
                        [gameKey, usuarioId],
                        (deleteError) => {
                            if (deleteError) {
                                return res.status(500).json({
                                    success: false,
                                    mensaje: `No se pudo quitar el voto "${etiquetaVoto}".`
                                });
                            }

                            return res.json({ success: true, mensaje: "Voto quitado." });
                        }
                    );
                }

                const iniciarTransaccion = () => db.run("BEGIN IMMEDIATE", (transactionError) => {
                    if (transactionError) {
                        return res.status(500).json({ success: false, mensaje: "No se pudo guardar el voto." });
                    }

                    const rollback = (message) => db.run("ROLLBACK", (rollbackError) => {
                        if (rollbackError) {
                            console.error("No se pudo revertir la actualización del voto:", rollbackError);
                        }
                        return res.status(500).json({ success: false, mensaje: message });
                    });

                    db.run(
                        `DELETE FROM ${tablaOpuesta} WHERE juego_key = ? AND usuario_id = ?`,
                        [gameKey, usuarioId],
                        (deleteError) => {
                            if (deleteError) return rollback("No se pudo actualizar el voto anterior.");

                            db.run(
                                `INSERT OR IGNORE INTO ${tablaVoto}(juego_key, usuario_id) VALUES(?, ?)`,
                                [gameKey, usuarioId],
                                (insertError) => {
                                    if (insertError) return rollback(`No se pudo guardar "${etiquetaVoto}".`);

                                    db.run("COMMIT", (commitError) => {
                                        if (commitError) return rollback("No se pudo confirmar el voto.");
                                        return res.json({ success: true, mensaje: "Voto guardado." });
                                    });
                                }
                            );
                        }
                    );
                });

                const juegoRecibido = req.body?.juego || {};
                const nombreJuego = typeof juegoRecibido.nombre === "string" ? juegoRecibido.nombre.trim() : "";
                if (!quitarVoto && nombreJuego && normalizarClaveJuego(nombreJuego) === gameKey) {
                    const genero = typeof juegoRecibido.genero === "string" ? juegoRecibido.genero.trim() : "";
                    const descripcion = typeof juegoRecibido.descripcion === "string" ? juegoRecibido.descripcion.trim() : "";
                    const imagen = typeof juegoRecibido.imagen === "string" && !juegoRecibido.imagen.startsWith("data:")
                        ? juegoRecibido.imagen.trim()
                        : "";
                    return db.run(
                        `INSERT OR IGNORE INTO juegos_visitas(juego_key, nombre, genero, imagen, descripcion, visitas)
                         VALUES(?, ?, ?, ?, ?, 0)`,
                        [gameKey, nombreJuego, genero, imagen, descripcion],
                        (metadataError) => {
                            if (metadataError) {
                                return res.status(500).json({ success: false, mensaje: "No se pudo registrar el juego." });
                            }
                            return iniciarTransaccion();
                        }
                    );
                }

                return iniciarTransaccion();
            }
        );

        if (TITULOS_JUEGOS_PERMITIDOS.has(gameKey)) {
            return registrarVoto();
        }

        return db.get(
            "SELECT id FROM juegos WHERE nombre_key = ?",
            [gameKey],
            (gameError, juegoRegistrado) => {
                if (gameError) {
                    return res.status(500).json({ success: false, mensaje: "No se pudo verificar el juego." });
                }
                if (!juegoRegistrado) {
                    return res.status(404).json({
                        success: false,
                        mensaje: "Este juego no existe en el catálogo de Zenkai Games.",
                        code: "GAME_NOT_FOUND",
                    });
                }
                return registrarVoto();
            }
        );
    };

    return {
        obtenerRecomendados,
        obtenerRankings,
        obtenerEstadisticasJuego,
        registrarVisita,
        darLike: (req, res) => actualizarVotoJuego(req, res, "like"),
        quitarLike: (req, res) => actualizarVotoJuego(req, res, "like", true),
        darDislike: (req, res) => actualizarVotoJuego(req, res, "dislike"),
        quitarDislike: (req, res) => actualizarVotoJuego(req, res, "dislike", true),
    };
}