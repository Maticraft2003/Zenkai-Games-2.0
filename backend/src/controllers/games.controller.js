import { normalizarClaveJuego } from "../../gameKeys.js";
import { buscarJuegosRAWG, obtenerJuegoRAWG } from "../services/rawg.service.js";

const PUNTUACION_PREDETERMINADA = 7;
const MAXIMO_CARACTERES_IMAGEN = 28 * 1024 * 1024;

const CONSULTA_JUEGOS_POPULARIDAD = `
        SELECT juegos.id, juegos.nombre, juegos.genero, juegos.puntuacion,
            juegos.plataforma, juegos.plataformas, juegos.jugadores, juegos.rawg_id,
            juegos.etiqueta, juegos.imagen, juegos.descripcion, juegos.catalog_key, juegos.created_at,
           COALESCE(visitas.visitas, 0) AS visitas,
           COALESCE(calificaciones.cantidad, 0) AS cantidad_calificaciones,
           calificaciones.promedio AS puntuacion_comunidad,
           COALESCE(visitas.visitas, 0) + 2 * COALESCE(calificaciones.cantidad, 0) AS popularidad
    FROM juegos
    LEFT JOIN juegos_visitas AS visitas ON visitas.juego_key = juegos.nombre_key
    LEFT JOIN (
        SELECT juego_key, COUNT(*) AS cantidad, AVG(puntuacion) AS promedio
        FROM juegos_calificaciones
        GROUP BY juego_key
    ) AS calificaciones ON calificaciones.juego_key = juegos.nombre_key
    ORDER BY puntuacion_comunidad IS NULL ASC, puntuacion_comunidad DESC,
             cantidad_calificaciones DESC, visitas DESC,
             juegos.nombre COLLATE NOCASE ASC, juegos.id ASC
`;

const validarDatosJuego = (datos) => {
    const camposObligatorios = [
        ["nombre", "El nombre"],
        ["genero", "El género"],
        ["jugadores", "La cantidad de jugadores"],
        ["imagen", "La imagen"],
        ["descripcion", "La descripción"]
    ];

    for (const [campo, etiqueta] of camposObligatorios) {
        if (typeof datos?.[campo] !== "string" || !datos[campo].trim()) {
            return `${etiqueta} es obligatorio.`;
        }
    }

    if (!Array.isArray(datos?.plataformas) || datos.plataformas.length === 0) {
        return "El juego debe tener al menos una plataforma reconocida.";
    }

    if (!Number.isInteger(Number(datos?.rawgId)) || Number(datos.rawgId) < 1) {
        return "Seleccioná el juego en los resultados de la búsqueda externa.";
    }

    const limites = [
        ["nombre", 255, "El nombre"],
        ["genero", 120, "El género"],
        ["imagen", MAXIMO_CARACTERES_IMAGEN, "La imagen"],
        ["descripcion", 10000, "La descripción"]
    ];

    for (const [campo, maximo, etiqueta] of limites) {
        if (datos[campo].trim().length > maximo) {
            return `${etiqueta} supera el máximo permitido de ${maximo} caracteres.`;
        }
    }

    const puntuacion = datos?.puntuacion;
    if (puntuacion !== undefined && puntuacion !== null && puntuacion !== "") {
        const valorPuntuacion = Number(puntuacion);
        if (!Number.isFinite(valorPuntuacion) || valorPuntuacion < 0 || valorPuntuacion > 10) {
            return "La puntuación debe ser un número entre 0 y 10.";
        }
    }

    return null;
};

const esNombreDuplicado = (error) => error?.message?.includes("juegos.nombre_key");

const prepararDatosVerificados = async (datos) => {
    const juegoRAWG = await obtenerJuegoRAWG(datos.rawgId);
    if (normalizarClaveJuego(datos.nombre) !== normalizarClaveJuego(juegoRAWG.nombre)) {
        const error = new Error("El nombre no coincide con el juego reconocido por el catálogo externo.");
        error.code = "RAWG_NAME_MISMATCH";
        throw error;
    }

    const plataformasSolicitadas = Array.isArray(datos.plataformas)
        ? datos.plataformas.filter((plataforma) => typeof plataforma === "string" && plataforma.trim())
        : [];
    const plataformasReconocidas = juegoRAWG.plataformas.length > 0
        ? juegoRAWG.plataformas
        : plataformasSolicitadas;

    return {
        nombre: juegoRAWG.nombre,
        genero: juegoRAWG.genero || (typeof datos.genero === "string" ? datos.genero.trim() : ""),
        jugadores: typeof datos.jugadores === "string" ? datos.jugadores.trim() : "",
        plataformas: [...new Set(plataformasReconocidas)],
        plataforma: [...new Set(plataformasReconocidas)].join(", "),
        rawgId: juegoRAWG.rawgId,
        etiqueta: typeof datos.etiqueta === "string" ? datos.etiqueta.trim() : "",
        puntuacion: datos.puntuacion === undefined || datos.puntuacion === null || datos.puntuacion === ""
            ? PUNTUACION_PREDETERMINADA
            : Number(datos.puntuacion),
        imagen: typeof datos.imagen === "string" && datos.imagen.trim()
            ? datos.imagen.trim()
            : juegoRAWG.imagen,
        descripcion: typeof datos.descripcion === "string" && datos.descripcion.trim()
            ? datos.descripcion.trim()
            : juegoRAWG.descripcion,
        catalogKey: typeof datos.catalogKey === "string" ? datos.catalogKey : null,
    };
};

const responderErrorCatalogoExterno = (res, error) => {
    if (error.code === "RAWG_API_KEY_MISSING") {
        return res.status(503).json({
            success: false,
            mensaje: "La búsqueda externa todavía no está configurada en el backend."
        });
    }
    if (error.code === "RAWG_GAME_NOT_FOUND" || error.code === "RAWG_NAME_MISMATCH") {
        return res.status(400).json({ success: false, mensaje: error.message });
    }
    return res.status(502).json({
        success: false,
        mensaje: "No se pudo verificar el juego con el catálogo externo. Intentá nuevamente."
    });
};

export function crearControladorJuegos({ db }) {
    const buscarEnCatalogoExterno = async (req, res) => {
        const termino = typeof req.query.q === "string" ? req.query.q.trim() : "";
        if (termino.length < 2 || termino.length > 100) {
            return res.status(400).json({
                success: false,
                mensaje: "Escribí entre 2 y 100 caracteres para buscar un juego."
            });
        }

        try {
            const juegos = await buscarJuegosRAWG(termino);
            return res.json({ success: true, juegos });
        } catch (error) {
            if (error.code === "RAWG_API_KEY_MISSING") {
                return res.status(503).json({
                    success: false,
                    mensaje: "La búsqueda externa todavía no está configurada en el backend."
                });
            }
            return res.status(502).json({
                success: false,
                mensaje: "No se pudo consultar el catálogo externo. Intentá nuevamente."
            });
        }
    };

    const listarJuegos = (req, res) => {
        db.all(CONSULTA_JUEGOS_POPULARIDAD, (err, rows) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    mensaje: "Error al obtener los juegos",
                    error: err.message
                });
            }

            return res.json({ success: true, juegos: rows });
        });
    };

    const listarCatalogoOculto = (req, res) => {
        db.all("SELECT juego_key FROM juegos_catalogo_ocultos", (err, rows) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    mensaje: "No se pudo cargar el catálogo oculto."
                });
            }

            return res.json({ success: true, juegos: rows.map((row) => row.juego_key) });
        });
    };

    const ocultarJuegoCatalogo = (req, res) => {
        const { juegoKey } = req.params;
        if (!juegoKey) {
            return res.status(400).json({ success: false, mensaje: "El juego no es válido." });
        }

        db.run(
            "INSERT OR IGNORE INTO juegos_catalogo_ocultos(juego_key) VALUES(?)",
            [juegoKey],
            (err) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        mensaje: "No se pudo quitar el juego del catálogo."
                    });
                }

                return res.json({ success: true, mensaje: "Juego eliminado del catálogo." });
            }
        );
    };

    const obtenerJuego = (req, res) => {
        const { id } = req.params;
        db.get(
            `SELECT juegos.id, juegos.nombre, juegos.genero, juegos.puntuacion,
                    juegos.plataforma, juegos.plataformas, juegos.jugadores, juegos.rawg_id,
                    juegos.etiqueta, juegos.imagen, juegos.descripcion, juegos.catalog_key,
                    COALESCE(visitas.visitas, 0) AS visitas,
                    COALESCE(calificaciones.cantidad, 0) AS cantidad_calificaciones,
                    calificaciones.promedio AS puntuacion_comunidad,
                    COALESCE(visitas.visitas, 0) + 2 * COALESCE(calificaciones.cantidad, 0) AS popularidad
             FROM juegos
             LEFT JOIN juegos_visitas AS visitas ON visitas.juego_key = juegos.nombre_key
             LEFT JOIN (
                 SELECT juego_key, COUNT(*) AS cantidad, AVG(puntuacion) AS promedio
                 FROM juegos_calificaciones
                 GROUP BY juego_key
             ) AS calificaciones ON calificaciones.juego_key = juegos.nombre_key
             WHERE juegos.id = ?`,
            [id],
            (err, juego) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        mensaje: "Error al buscar el juego",
                        error: err.message
                    });
                }

                if (!juego) {
                    return res.status(404).json({ success: false, mensaje: "Juego no encontrado" });
                }

                return res.json({ success: true, juego });
            }
        );
    };

    const crearJuego = async (req, res) => {
        try {
            const datos = await prepararDatosVerificados(req.body || {});
            const errorValidacion = validarDatosJuego(datos);
            if (errorValidacion) {
                return res.status(400).json({ success: false, mensaje: errorValidacion });
            }

            const nombreKey = normalizarClaveJuego(datos.nombre);
            db.get(
            `SELECT id FROM juegos
             WHERE nombre_key = ?
                OR (? = 'resident evil 4' AND nombre_key = 'resident evil 4 remake')`,
            [nombreKey, nombreKey],
            (duplicateError, duplicate) => {
                if (duplicateError) {
                    return res.status(500).json({ success: false, mensaje: "No se pudo validar el nombre del juego." });
                }
                if (duplicate) {
                    return res.status(409).json({ success: false, mensaje: "Ya existe un juego con ese nombre." });
                }

                db.run(
                    `INSERT INTO juegos(
                        nombre, genero, puntuacion, plataforma, plataformas, jugadores, rawg_id,
                        etiqueta, imagen, descripcion, catalog_key, nombre_key, created_at
                     ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                    [
                        datos.nombre,
                        datos.genero,
                        datos.puntuacion,
                        datos.plataforma,
                        JSON.stringify(datos.plataformas),
                        datos.jugadores,
                        datos.rawgId,
                        datos.etiqueta,
                        datos.imagen,
                        datos.descripcion,
                        datos.catalogKey,
                        nombreKey,
                    ],
                    function (err) {
                        if (err) {
                            if (esNombreDuplicado(err)) {
                                return res.status(409).json({ success: false, mensaje: "Ya existe un juego con ese nombre." });
                            }
                            return res.status(500).json({
                                success: false,
                                mensaje: "Error al crear el juego",
                                error: err.message
                            });
                        }

                        const responderCreacion = () => res.status(201).json({
                            success: true,
                            mensaje: "Juego creado correctamente",
                            id: this.lastID
                        });

                        if (!datos.catalogKey) return responderCreacion();

                        db.run(
                            "DELETE FROM juegos_catalogo_ocultos WHERE juego_key = ?",
                            [datos.catalogKey],
                            (restoreError) => {
                                if (restoreError) {
                                    return res.status(500).json({
                                        success: false,
                                        mensaje: "El juego se guardó, pero no se pudo actualizar el catálogo."
                                    });
                                }

                                return responderCreacion();
                            }
                        );
                    }
                );
            }
            );
        } catch (error) {
            return responderErrorCatalogoExterno(res, error);
        }
    };

    const actualizarJuego = async (req, res) => {
        try {
            const datos = await prepararDatosVerificados(req.body || {});
            const errorValidacion = validarDatosJuego(datos);
            if (errorValidacion) {
                return res.status(400).json({ success: false, mensaje: errorValidacion });
            }

            const { id } = req.params;
            db.get("SELECT 1 FROM juegos WHERE id = ?", [id], (gameError) => {
            if (gameError) {
                return res.status(500).json({ success: false, mensaje: "No se pudo validar el juego." });
            }

            db.get(
                "SELECT id FROM juegos WHERE nombre_key = ? AND id != ?",
                [normalizarClaveJuego(datos.nombre), id],
                (duplicateError, duplicate) => {
                    if (duplicateError) {
                        return res.status(500).json({ success: false, mensaje: "No se pudo validar el nombre del juego." });
                    }
                    if (duplicate) {
                        return res.status(409).json({ success: false, mensaje: "Ya existe un juego con ese nombre." });
                    }

                    db.run(
                        `UPDATE juegos
                         SET nombre = ?, nombre_key = ?, genero = ?, puntuacion = ?, plataforma = ?,
                             plataformas = ?, jugadores = ?, rawg_id = ?, etiqueta = ?, imagen = ?,
                             descripcion = ?, catalog_key = ?
                         WHERE id = ?`,
                        [
                            datos.nombre,
                            normalizarClaveJuego(datos.nombre),
                            datos.genero,
                            datos.puntuacion,
                            datos.plataforma,
                            JSON.stringify(datos.plataformas),
                            datos.jugadores,
                            datos.rawgId,
                            datos.etiqueta,
                            datos.imagen,
                            datos.descripcion,
                            datos.catalogKey,
                            id,
                        ],
                        function (err) {
                            if (err) {
                                if (esNombreDuplicado(err)) {
                                    return res.status(409).json({ success: false, mensaje: "Ya existe un juego con ese nombre." });
                                }
                                return res.status(500).json({
                                    success: false,
                                    mensaje: "Error al actualizar el juego",
                                    error: err.message
                                });
                            }

                            const cambios = this.changes;
                            const responderActualizacion = () => res.json({
                                success: true,
                                mensaje: "Juego actualizado correctamente",
                                cambios
                            });

                            if (!datos.catalogKey) return responderActualizacion();

                            db.run(
                                "DELETE FROM juegos_catalogo_ocultos WHERE juego_key = ?",
                                [datos.catalogKey],
                                (restoreError) => {
                                    if (restoreError) {
                                        return res.status(500).json({
                                            success: false,
                                            mensaje: "El juego se actualizó, pero no se pudo actualizar el catálogo."
                                        });
                                    }

                                    return responderActualizacion();
                                }
                            );
                        }
                    );
                }
            );
            });
        } catch (error) {
            return responderErrorCatalogoExterno(res, error);
        }
    };

    const eliminarJuego = (req, res) => {
        const { id } = req.params;
        const catalogKey = typeof req.body?.catalogKey === "string" ? req.body.catalogKey : "";

        db.run("DELETE FROM juegos WHERE id = ?", [id], function (err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    mensaje: "Error al eliminar el juego",
                    error: err.message
                });
            }

            const cambios = this.changes;
            if (!catalogKey) {
                return res.json({ success: true, mensaje: "Juego eliminado correctamente", cambios });
            }

            db.run(
                "INSERT OR IGNORE INTO juegos_catalogo_ocultos(juego_key) VALUES(?)",
                [catalogKey],
                (hideError) => {
                    if (hideError) {
                        return res.status(500).json({
                            success: false,
                            mensaje: "El juego se eliminó, pero no se pudo actualizar el catálogo."
                        });
                    }

                    return res.json({ success: true, mensaje: "Juego eliminado correctamente", cambios });
                }
            );
        });
    };

    return {
        buscarEnCatalogoExterno,
        listarJuegos,
        listarCatalogoOculto,
        ocultarJuegoCatalogo,
        obtenerJuego,
        crearJuego,
        actualizarJuego,
        eliminarJuego,
    };
}