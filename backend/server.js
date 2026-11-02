import db, { databaseReady } from "./database.js";
import bcrypt from "bcrypt";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createHash, randomBytes } from "crypto";
import { normalizarClaveJuego, TITULOS_JUEGOS_PERMITIDOS } from "./gameKeys.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "28mb" }));

const PUNTUACION_PREDETERMINADA = 7;
const DURACION_SESION_MS = 30 * 24 * 60 * 60 * 1000;
const MAXIMO_CARACTERES_IMAGEN = 28 * 1024 * 1024;

const hashToken = (token) => createHash("sha256").update(token).digest("hex");

const crearSesion = (usuarioId, callback) => {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + DURACION_SESION_MS).toISOString();

    db.run(
        "INSERT INTO auth_sessions(token_hash, user_id, expires_at) VALUES(?, ?, ?)",
        [hashToken(token), usuarioId, expiresAt],
        (error) => callback(error, error ? null : token)
    );
};

const requerirSesion = (req, res, next) => {
    const authorization = req.get("authorization") || "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";

    if (!token) {
        return res.status(401).json({
            success: false,
            mensaje: "Iniciá sesión para agregar un juego.",
            code: "AUTH_REQUIRED",
        });
    }

    db.get(
        "SELECT user_id, expires_at FROM auth_sessions WHERE token_hash = ?",
        [hashToken(token)],
        (sessionError, session) => {
            if (sessionError) {
                return res.status(500).json({
                    success: false,
                    mensaje: "No se pudo verificar tu sesión.",
                });
            }

            if (!session || Date.parse(session.expires_at) <= Date.now()) {
                return res.status(401).json({
                    success: false,
                    mensaje: "Tu sesión venció. Iniciá sesión nuevamente.",
                    code: "SESSION_EXPIRED",
                });
            }

            req.usuarioId = session.user_id;
            return next();
        }
    );
};

const requerirAdministrador = (req, res, next) => {
    const authorization = req.get("authorization") || "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";

    if (!token) {
        return res.status(401).json({
            success: false,
            mensaje: "Iniciá sesión como administrador para gestionar juegos.",
            code: "ADMIN_AUTH_REQUIRED",
        });
    }

    db.get(
        `SELECT user_roles.role, auth_sessions.user_id, auth_sessions.expires_at
         FROM auth_sessions
         JOIN user_roles ON user_roles.user_id = auth_sessions.user_id
         WHERE auth_sessions.token_hash = ?`,
        [hashToken(token)],
        (sessionError, session) => {
            if (sessionError) {
                return res.status(500).json({
                    success: false,
                    mensaje: "No se pudo verificar el permiso de administración.",
                });
            }

            if (!session || Date.parse(session.expires_at) <= Date.now()) {
                return res.status(401).json({
                    success: false,
                    mensaje: "Tu sesión venció. Iniciá sesión nuevamente.",
                    code: "SESSION_EXPIRED",
                });
            }

            if (session.role !== "admin") {
                return res.status(403).json({
                    success: false,
                    mensaje: "Solo un administrador puede gestionar los juegos.",
                    code: "ADMIN_REQUIRED",
                });
            }

            req.usuarioAdminId = session.user_id;
            return next();
        }
    );
};

const validarDatosJuego = (datos) => {
    const camposObligatorios = [
        ["nombre", "El nombre"],
        ["genero", "El género"],
        ["imagen", "La imagen"],
        ["descripcion", "La descripción"]
    ];

    for (const [campo, etiqueta] of camposObligatorios) {
        if (typeof datos?.[campo] !== "string" || !datos[campo].trim()) {
            return `${etiqueta} es obligatorio.`;
        }
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

const validarTituloJuego = (nombre, nombreActual = "") => {
    const clave = normalizarClaveJuego(nombre);
    if (TITULOS_JUEGOS_PERMITIDOS.has(clave) || (nombreActual && clave === normalizarClaveJuego(nombreActual))) {
        return null;
    }
    return "El nombre debe corresponder a un juego del catálogo permitido.";
};

const esNombreDuplicado = (error) => error?.message?.includes("juegos.nombre_key");

const CONSULTA_JUEGOS_POPULARIDAD = `
    SELECT juegos.id, juegos.nombre, juegos.genero, juegos.puntuacion,
           juegos.plataforma, juegos.etiqueta, juegos.imagen, juegos.descripcion,
           juegos.catalog_key, juegos.created_at,
           COALESCE(visitas.visitas, 0) AS visitas,
           COALESCE(likes.likes, 0) AS likes,
           COALESCE(dislikes.dislikes, 0) AS dislikes,
           CASE
               WHEN COALESCE(likes.likes, 0) + COALESCE(dislikes.dislikes, 0) = 0 THEN NULL
               ELSE ROUND(
                   10.0 * COALESCE(likes.likes, 0)
                   / (COALESCE(likes.likes, 0) + COALESCE(dislikes.dislikes, 0)),
                   1
               )
           END AS puntuacion_comunidad,
           COALESCE(visitas.visitas, 0) + 2 * COALESCE(likes.likes, 0) AS popularidad
    FROM juegos
    LEFT JOIN juegos_visitas AS visitas ON visitas.juego_key = juegos.nombre_key
    LEFT JOIN (
        SELECT juego_key, COUNT(*) AS likes FROM juegos_likes GROUP BY juego_key
    ) AS likes ON likes.juego_key = juegos.nombre_key
    LEFT JOIN (
        SELECT juego_key, COUNT(*) AS dislikes FROM juegos_dislikes GROUP BY juego_key
    ) AS dislikes ON dislikes.juego_key = juegos.nombre_key
    ORDER BY puntuacion_comunidad IS NULL ASC, puntuacion_comunidad DESC,
             (COALESCE(likes.likes, 0) + COALESCE(dislikes.dislikes, 0)) DESC,
             visitas DESC, likes DESC,
             juegos.nombre COLLATE NOCASE ASC, juegos.id ASC
`;

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

app.get("/", (req, res) => {
  res.send("Backend de Zenkai Games funcionando");
});

const PORT = process.env.PORT || 3001;
app.post("/login", (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            mensaje: "Ingresá el correo y la contraseña."
        });
    }

    db.get(
        `SELECT usuarios.id, usuarios.username, usuarios.email, usuarios.password,
                COALESCE(user_roles.role, 'usuario') AS role
         FROM usuarios
         LEFT JOIN user_roles ON user_roles.user_id = usuarios.id
         WHERE usuarios.email = ?`,
        [email],
        async (err, usuario) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    mensaje: "Error del servidor"
                });
            }

            let contrasenaValida = false;
            if (usuario) {
                try {
                    contrasenaValida = await bcrypt.compare(password, usuario.password);
                } catch (compareError) {
                    console.error("No se pudo verificar la contraseña:", compareError);
                    return res.status(500).json({
                        success: false,
                        mensaje: "Error del servidor"
                    });
                }
            }

            if (!usuario || !contrasenaValida) {
                return res.json({
                    success: false,
                    mensaje: "Correo o contraseña incorrectos"
                });
            }

            crearSesion(usuario.id, (sessionError, token) => {
                if (sessionError) {
                    console.error("No se pudo crear la sesión del usuario:", sessionError);
                    return res.status(500).json({
                        success: false,
                        mensaje: "No se pudo iniciar la sesión.",
                    });
                }

                db.run("DELETE FROM auth_sessions WHERE expires_at <= ?", [new Date().toISOString()]);
                return res.json({
                    success: true,
                    mensaje: "Bienvenido",
                    usuario: {
                        id: usuario.id,
                        username: usuario.username,
                        email: usuario.email,
                        role: usuario.role,
                        token,
                    },
                });
            });
        }
    );
});
app.post("/register", (req, res) => {
    const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            mensaje: "Completá el nombre, el correo y la contraseña."
        });
    }

    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
        return res.status(400).json({
            success: false,
            mensaje: "La contraseña debe tener al menos 8 caracteres y no superar los 72 bytes."
        });
    }

    bcrypt.hash(password, 12, (hashError, hashedPassword) => {
        if (hashError) {
            console.error("No se pudo proteger la contraseña:", hashError);
            return res.status(500).json({
              success: false,
              mensaje: "No se pudo crear la cuenta."
            });
        }

        db.run(
            `INSERT INTO usuarios(username, email, password)
             VALUES(?, ?, ?)`,
            [username, email, hashedPassword],
            function (err) {
              if (err) {
                  if (err.code === "SQLITE_CONSTRAINT") {
                      return res.status(409).json({
                          success: false,
                          mensaje: "Ese correo ya está registrado."
                      });
                  }

                  return res.status(500).json({
                      success: false,
                      mensaje: "No se pudo crear la cuenta."
                  });
              }

              const userId = this.lastID;
              db.run("INSERT INTO user_roles(user_id, role) VALUES(?, 'usuario')", [userId], (roleError) => {
                  if (roleError) {
                      console.error("No se pudo asignar el rol inicial a la cuenta:", roleError);
                      return res.status(500).json({
                          success: false,
                          mensaje: "La cuenta se creó, pero no se pudo terminar su configuración."
                      });
                  }

                  return res.status(201).json({
                      success: true,
                      mensaje: "Usuario creado correctamente.",
                      usuario: { id: userId, username, email, role: "usuario" }
                  });
              });
            }
        );
    });
});

app.get("/perfil/:id", (req, res) => {
    const { id } = req.params;

    db.get(
        `SELECT usuarios.id, usuarios.username, usuarios.email,
                COALESCE(user_roles.role, 'usuario') AS role
         FROM usuarios
         LEFT JOIN user_roles ON user_roles.user_id = usuarios.id
         WHERE usuarios.id = ?`,
        [id],
        (err, usuario) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    mensaje: "No se pudo consultar el perfil."
                });
            }

            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    mensaje: "No se encontró la cuenta."
                });
            }

            return res.json({ success: true, usuario });
        }
    );
});

app.patch("/perfil/:id", (req, res) => {
    const { id } = req.params;
    const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const currentPassword = typeof req.body?.currentPassword === "string" ? req.body.currentPassword : "";
    const newPassword = typeof req.body?.newPassword === "string" ? req.body.newPassword : "";

    if (!username || !email || !currentPassword) {
        return res.status(400).json({
            success: false,
            mensaje: "El nombre, el correo y la contraseña actual son obligatorios."
        });
    }

    if (newPassword && (newPassword.length < 8 || Buffer.byteLength(newPassword, "utf8") > 72)) {
        return res.status(400).json({
            success: false,
            mensaje: "La nueva contraseña debe tener al menos 8 caracteres y no superar los 72 bytes."
        });
    }

    db.get(
        `SELECT usuarios.id, usuarios.username, usuarios.email, usuarios.password,
                COALESCE(user_roles.role, 'usuario') AS role
         FROM usuarios
         LEFT JOIN user_roles ON user_roles.user_id = usuarios.id
         WHERE usuarios.id = ?`,
        [id],
        async (findError, usuario) => {
            if (findError) {
              return res.status(500).json({
                  success: false,
                  mensaje: "No se pudo consultar el perfil."
              });
            }

            if (!usuario) {
              return res.status(404).json({
                  success: false,
                  mensaje: "No se encontró la cuenta."
              });
            }

            try {
              const contrasenaValida = await bcrypt.compare(currentPassword, usuario.password);
              if (!contrasenaValida) {
                  return res.status(401).json({
                      success: false,
                      mensaje: "La contraseña actual es incorrecta."
                  });
              }

              const hashedPassword = newPassword
                  ? await bcrypt.hash(newPassword, 12)
                  : usuario.password;

              db.run(
                  `UPDATE usuarios
                   SET username = ?, email = ?, password = ?
                   WHERE id = ?`,
                  [username, email, hashedPassword, id],
                  function (updateError) {
                      if (updateError) {
                          if (updateError.code === "SQLITE_CONSTRAINT") {
                              return res.status(409).json({
                                  success: false,
                                  mensaje: "Ese correo ya está registrado por otra cuenta."
                              });
                          }

                          return res.status(500).json({
                              success: false,
                              mensaje: "No se pudo actualizar el perfil."
                          });
                      }

                      return res.json({
                          success: true,
                          mensaje: "Perfil actualizado correctamente.",
                          usuario: { id: usuario.id, username, email, role: usuario.role }
                      });
                  }
              );
            } catch (passwordError) {
              console.error("No se pudo verificar o actualizar la contraseña:", passwordError);
              return res.status(500).json({
                  success: false,
                  mensaje: "No se pudo actualizar el perfil."
              });
            }
        }
    );
});

app.get("/juegos", (req, res) => {
    db.all(CONSULTA_JUEGOS_POPULARIDAD, (err, rows) => {
        if (err){
            return res.status(500).json({
                success: false,
                mensaje: "Error al obtener los juegos",
                error: err.message
            });
        }

        return res.json({
            success: true,
            juegos: rows
        });
    }); 
});

app.get("/catalogo-juegos/ocultos", (req, res) => {
    db.all("SELECT juego_key FROM juegos_catalogo_ocultos", (err, rows) => {
        if (err) {
            return res.status(500).json({
                success: false,
                mensaje: "No se pudo cargar el catálogo oculto."
            });
        }

        return res.json({
            success: true,
            juegos: rows.map((row) => row.juego_key)
        });
    });
});

app.delete("/catalogo-juegos/:juegoKey", requerirAdministrador, (req, res) => {
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
});

app.get("/engagement/juegos/recomendados", (req, res) => {
    db.all(
        `SELECT visitas.juego_key, visitas.nombre, visitas.genero, visitas.imagen,
                visitas.descripcion, visitas.visitas,
                COALESCE(likes.likes, 0) AS likes,
                COALESCE(dislikes.dislikes, 0) AS dislikes,
                CASE
                    WHEN COALESCE(likes.likes, 0) + COALESCE(dislikes.dislikes, 0) = 0 THEN NULL
                    ELSE ROUND(
                        10.0 * COALESCE(likes.likes, 0)
                        / (COALESCE(likes.likes, 0) + COALESCE(dislikes.dislikes, 0)),
                        1
                    )
                END AS puntuacion_comunidad,
                visitas.visitas + 2 * COALESCE(likes.likes, 0) AS popularidad,
                visitas.visitas + 2 * COALESCE(likes.likes, 0) AS interes_total
         FROM juegos_visitas AS visitas
         LEFT JOIN (
             SELECT juego_key, COUNT(*) AS likes FROM juegos_likes GROUP BY juego_key
         ) AS likes ON likes.juego_key = visitas.juego_key
         LEFT JOIN (
             SELECT juego_key, COUNT(*) AS dislikes FROM juegos_dislikes GROUP BY juego_key
         ) AS dislikes ON dislikes.juego_key = visitas.juego_key
         WHERE visitas.visitas > 0
            OR COALESCE(likes.likes, 0) > 0
            OR COALESCE(dislikes.dislikes, 0) > 0
         ORDER BY puntuacion_comunidad IS NULL ASC, puntuacion_comunidad DESC,
                  (COALESCE(likes.likes, 0) + COALESCE(dislikes.dislikes, 0)) DESC,
                  popularidad DESC, visitas.visitas DESC,
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
});

app.get("/engagement/juegos/rankings", (req, res) => {
    db.all(CONSULTA_RANKINGS_JUEGOS, (err, juegos) => {
        if (err) {
            return res.status(500).json({
                success: false,
                mensaje: "No se pudieron cargar los rankings."
            });
        }

        return res.json({ success: true, juegos });
    });
});

app.get("/engagement/juegos/:gameKey", (req, res) => {
    const gameKey = normalizarClaveJuego(req.params.gameKey || "");
    const usuarioId = Number(req.query.usuarioId);

    if (!gameKey) {
        return res.status(400).json({ success: false, mensaje: "El juego no es válido." });
    }

    db.get(
        `WITH votos AS (
             SELECT
                 (SELECT COUNT(*) FROM juegos_likes WHERE juego_key = ?) AS likes,
                 (SELECT COUNT(*) FROM juegos_dislikes WHERE juego_key = ?) AS dislikes
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
         FROM votos`,
        [
            gameKey,
            gameKey,
            gameKey,
            gameKey,
            gameKey,
            gameKey,
            gameKey,
            gameKey,
            gameKey,
            gameKey,
            Number.isInteger(usuarioId) && usuarioId > 0 ? usuarioId : 0,
            gameKey,
            Number.isInteger(usuarioId) && usuarioId > 0 ? usuarioId : 0,
        ],
        (err, juego) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    mensaje: "No se pudieron cargar las estadísticas del juego."
                });
            }

            return res.json({ success: true, juego });
        }
    );
});

app.post("/engagement/juegos/:gameKey/visita", (req, res) => {
    const nombre = typeof req.body?.juego?.nombre === "string" ? req.body.juego.nombre.trim() : "";
    const gameKey = normalizarClaveJuego(req.params.gameKey || "");
    const juegoRecibido = req.body?.juego || {};
    const usuarioId = Number(req.body?.usuarioId);
    const usuarioIdValido = Number.isInteger(usuarioId) && usuarioId > 0 ? usuarioId : 0;
    const sessionId = typeof req.body?.sessionId === "string" ? req.body.sessionId.trim() : "";
    const visitanteKey = usuarioIdValido
        ? `usuario:${usuarioIdValido}`
        : /^[A-Za-z0-9._:-]{8,128}$/.test(sessionId)
            ? `sesion:${sessionId}`
            : null;

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
                [
                    gameKey,
                    juego.nombre,
                    juego.genero || "",
                    juego.imagen || "",
                    juego.descripcion || "",
                    tieneDescripcionPropia ? 1 : 0,
                ],
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

                    if (!visitanteKey) {
                        cargarEstadisticas(false);
                        return;
                    }

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

                            const actualizarContador = (visitaContada) => {
                                if (!visitaContada) {
                                    cargarEstadisticas(false);
                                    return;
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
                                        cargarEstadisticas(true);
                                    }
                                );
                            };

                            actualizarContador(this.changes > 0);
                        }
                    );
                }
            );
        }
    );
});

const actualizarVotoJuego = (req, res, tipoVoto, quitarVoto = false) => {
    const gameKey = normalizarClaveJuego(req.params.gameKey || "");
    const usuarioId = Number(quitarVoto ? req.query.usuarioId : req.body?.usuarioId);
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

app.post("/engagement/juegos/:gameKey/like", (req, res) => {
    actualizarVotoJuego(req, res, "like");
});
app.delete("/engagement/juegos/:gameKey/like", (req, res) => {
    actualizarVotoJuego(req, res, "like", true);
});
app.post("/engagement/juegos/:gameKey/dislike", (req, res) => {
    actualizarVotoJuego(req, res, "dislike");
});
app.delete("/engagement/juegos/:gameKey/dislike", (req, res) => {
    actualizarVotoJuego(req, res, "dislike", true);
});

// Obtener un juego por ID
app.get("/juegos/:id", (req, res) => {
    const { id } = req.params;
    db.get(
        `SELECT juegos.id, juegos.nombre, juegos.genero, juegos.puntuacion,
                juegos.plataforma, juegos.etiqueta, juegos.imagen, juegos.descripcion,
                juegos.catalog_key,
                COALESCE(visitas.visitas, 0) AS visitas,
                COALESCE(likes.likes, 0) AS likes,
                COALESCE(dislikes.dislikes, 0) AS dislikes,
                CASE
                    WHEN COALESCE(likes.likes, 0) + COALESCE(dislikes.dislikes, 0) = 0 THEN NULL
                    ELSE ROUND(
                        10.0 * COALESCE(likes.likes, 0)
                        / (COALESCE(likes.likes, 0) + COALESCE(dislikes.dislikes, 0)),
                        1
                    )
                END AS puntuacion_comunidad,
                COALESCE(visitas.visitas, 0) + 2 * COALESCE(likes.likes, 0) AS popularidad
         FROM juegos
         LEFT JOIN juegos_visitas AS visitas ON visitas.juego_key = juegos.nombre_key
         LEFT JOIN (
             SELECT juego_key, COUNT(*) AS likes FROM juegos_likes GROUP BY juego_key
         ) AS likes ON likes.juego_key = juegos.nombre_key
         LEFT JOIN (
             SELECT juego_key, COUNT(*) AS dislikes FROM juegos_dislikes GROUP BY juego_key
         ) AS dislikes ON dislikes.juego_key = juegos.nombre_key
         WHERE juegos.id = ?
         `,
        [id],
        (err, juegos) => {
            if (err){
                return res.status(500).json({
                    success: false,
                    mensaje: "Error al buscar el juego",
                    error: err.message
                });
            }

            if (!juegos) {
                return res.status(404).json({
                    success: false,
                    mensaje: "Juego no encontrado"
                });
            }

            return res.json({
                success: true,
                juego: juegos
            });
        }
    );
});

// Crear un juego nuevo
app.post("/juegos", requerirSesion, (req, res) => {
    const errorValidacion = validarDatosJuego(req.body);
    if (errorValidacion) {
        return res.status(400).json({ success: false, mensaje: errorValidacion });
    }

    const { nombre, genero, plataforma, etiqueta, imagen, descripcion } = req.body;
    const nombreKey = normalizarClaveJuego(nombre);
    const puntuacion = req.body.puntuacion === undefined
        || req.body.puntuacion === null
        || req.body.puntuacion === ""
        ? PUNTUACION_PREDETERMINADA
        : Number(req.body.puntuacion);
    const catalogKey = typeof req.body.catalogKey === "string" ? req.body.catalogKey : null;

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

        const titleError = validarTituloJuego(nombre);
        if (titleError) {
            return res.status(400).json({ success: false, mensaje: titleError });
        }

        db.run(
            `INSERT INTO juegos(
                nombre, genero, puntuacion, plataforma, etiqueta, imagen, descripcion,
                catalog_key, nombre_key, created_at
             ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [
                nombre.trim(),
                genero.trim(),
                puntuacion,
                plataforma,
                etiqueta,
                imagen.trim(),
                descripcion.trim(),
                catalogKey,
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

                const id = this.lastID;
                const responderCreacion = () => res.status(201).json({
                    success: true,
                    mensaje: "Juego creado correctamente",
                    id
                });

                if (!catalogKey) return responderCreacion();

                db.run(
                    "DELETE FROM juegos_catalogo_ocultos WHERE juego_key = ?",
                    [catalogKey],
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
    });
});

// Editar un juego
app.put("/juegos/:id", requerirAdministrador, (req, res) => {
    const errorValidacion = validarDatosJuego(req.body);
    if (errorValidacion) {
        return res.status(400).json({ success: false, mensaje: errorValidacion });
    }

    const { id } = req.params;
    const { nombre, genero, puntuacion, plataforma, etiqueta, imagen, descripcion } = req.body;
    const catalogKey = typeof req.body.catalogKey === "string" ? req.body.catalogKey : null;

    db.get("SELECT nombre FROM juegos WHERE id = ?", [id], (gameError, juegoActual) => {
        if (gameError) {
            return res.status(500).json({ success: false, mensaje: "No se pudo validar el juego." });
        }

        db.get(
            "SELECT id FROM juegos WHERE nombre_key = ? AND id != ?",
            [normalizarClaveJuego(nombre), id],
            (duplicateError, duplicate) => {
                if (duplicateError) {
                    return res.status(500).json({ success: false, mensaje: "No se pudo validar el nombre del juego." });
                }
                if (duplicate) {
                    return res.status(409).json({ success: false, mensaje: "Ya existe un juego con ese nombre." });
                }

                const titleError = juegoActual ? validarTituloJuego(nombre, juegoActual.nombre) : null;
                if (titleError) {
                    return res.status(400).json({ success: false, mensaje: titleError });
                }

                db.run(
                    `UPDATE juegos
                     SET nombre = ?, nombre_key = ?, genero = ?, puntuacion = ?, plataforma = ?,
                         etiqueta = ?, imagen = ?, descripcion = ?, catalog_key = ?
                     WHERE id = ?`,
                    [
                        nombre.trim(),
                        normalizarClaveJuego(nombre),
                        genero.trim(),
                        puntuacion,
                        plataforma,
                        etiqueta,
                        imagen.trim(),
                        descripcion.trim(),
                        catalogKey,
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

                        if (!catalogKey) return responderActualizacion();

                        db.run(
                            "DELETE FROM juegos_catalogo_ocultos WHERE juego_key = ?",
                            [catalogKey],
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
});

// Eliminar un juego
app.delete("/juegos/:id", requerirAdministrador, (req, res) => {
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
            return res.json({
                success: true,
                mensaje: "Juego eliminado correctamente",
                cambios
            });
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

                return res.json({
                    success: true,
                    mensaje: "Juego eliminado correctamente",
                    cambios
                });
            }
        );
    });
});

app.get("/usuarios/:usuarioId/favoritos", (req, res) => {
    const { usuarioId } = req.params;

    db.all(
        `SELECT juego_key, nombre, genero, imagen, descripcion
         FROM favoritos
         WHERE usuario_id = ?
         ORDER BY id DESC`,
        [usuarioId],
        (err, favoritos) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    mensaje: "No se pudieron obtener los juegos favoritos."
                });
            }

            return res.json({ success: true, favoritos });
        }
    );
});

app.post("/usuarios/:usuarioId/favoritos", (req, res) => {
    const { usuarioId } = req.params;
    const juego = req.body?.juego;
    const nombre = typeof juego?.nombre === "string" ? juego.nombre.trim() : "";
    const genero = typeof juego?.genero === "string" ? juego.genero.trim() : "";
    const imagen = typeof juego?.imagen === "string" ? juego.imagen.trim() : "";
    const descripcion = typeof juego?.descripcion === "string" ? juego.descripcion.trim() : "";
    const juegoKey = normalizarClaveJuego(nombre);

    if (!nombre) {
        return res.status(400).json({
            success: false,
            mensaje: "El juego seleccionado no tiene un nombre válido."
        });
    }

    db.get("SELECT id FROM usuarios WHERE id = ?", [usuarioId], (userError, usuario) => {
        if (userError) {
            return res.status(500).json({
                success: false,
                mensaje: "No se pudo verificar la cuenta."
            });
        }

        if (!usuario) {
            return res.status(404).json({
                success: false,
                mensaje: "No se encontró la cuenta."
            });
        }

        db.run(
            `INSERT INTO favoritos(usuario_id, juego_key, nombre, genero, imagen, descripcion)
             VALUES(?, ?, ?, ?, ?, ?)
             ON CONFLICT(usuario_id, juego_key) DO UPDATE SET
                nombre = excluded.nombre,
                genero = excluded.genero,
                imagen = excluded.imagen,
                descripcion = excluded.descripcion`,
            [usuarioId, juegoKey, nombre, genero, imagen, descripcion],
            (err) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        mensaje: "No se pudo guardar el juego en favoritos."
                    });
                }

                return res.status(201).json({
                    success: true,
                    mensaje: "Juego agregado a favoritos."
                });
            }
        );
    });
});

app.delete("/usuarios/:usuarioId/favoritos/:juegoKey", (req, res) => {
    const { usuarioId, juegoKey } = req.params;

    db.run(
        "DELETE FROM favoritos WHERE usuario_id = ? AND juego_key = ?",
        [usuarioId, juegoKey],
        function (err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    mensaje: "No se pudo quitar el juego de favoritos."
                });
            }

            return res.json({
                success: true,
                mensaje: "Juego quitado de favoritos.",
                cambios: this.changes
            });
        }
    );
});

const crearRutasDeContenido = (ruta, tabla, claveRespuesta) => {
    app.get(`/${ruta}`, (req, res) => {
        const consulta = ruta === "comunidad"
            ? `SELECT comunidad.*,
                      (SELECT COUNT(*) FROM comunidad_comentarios
                       WHERE publicacion_id = comunidad.id) AS comentarios_count
               FROM comunidad
               ORDER BY id DESC`
            : `SELECT * FROM ${tabla} ORDER BY id DESC`;

        db.all(consulta, (err, rows) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    mensaje: `Error al obtener ${ruta}`,
                    error: err.message
                });
            }

            return res.json({
                success: true,
                [claveRespuesta]: rows
            });
        });
    });

    if (ruta === "comunidad") {
        app.get("/comunidad/:publicacionId/comentarios", (req, res) => {
            const publicacionId = Number(req.params.publicacionId);
            const usuarioId = Number(req.query.usuarioId);

            if (!Number.isInteger(publicacionId) || publicacionId < 1) {
                return res.status(400).json({ success: false, mensaje: "La publicación no es válida." });
            }

            db.all(
                `SELECT comentarios.id, comentarios.publicacion_id, comentarios.usuario_id,
                        usuarios.username, comentarios.contenido, comentarios.created_at,
                        (SELECT COUNT(*) FROM comunidad_comentarios_likes
                         WHERE comentario_id = comentarios.id) AS likes_count,
                        EXISTS(
                            SELECT 1 FROM comunidad_comentarios_likes
                            WHERE comentario_id = comentarios.id AND usuario_id = ?
                        ) AS liked_by_user
                 FROM comunidad_comentarios AS comentarios
                 JOIN usuarios ON usuarios.id = comentarios.usuario_id
                 WHERE comentarios.publicacion_id = ?
                 ORDER BY comentarios.id ASC`,
                [Number.isInteger(usuarioId) && usuarioId > 0 ? usuarioId : 0, publicacionId],
                (err, comentarios) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            mensaje: "No se pudieron cargar los comentarios."
                        });
                    }

                    return res.json({ success: true, comentarios });
                }
            );
        });

        app.post("/comunidad/:publicacionId/comentarios", (req, res) => {
            const publicacionId = Number(req.params.publicacionId);
            const usuarioId = Number(req.body?.usuarioId);
            const contenido = typeof req.body?.contenido === "string" ? req.body.contenido.trim() : "";

            if (!Number.isInteger(publicacionId) || publicacionId < 1
                || !Number.isInteger(usuarioId) || usuarioId < 1
                || !contenido || contenido.length > 1000) {
                return res.status(400).json({
                    success: false,
                    mensaje: "Escribí un comentario de hasta 1000 caracteres."
                });
            }

            db.get("SELECT id FROM usuarios WHERE id = ?", [usuarioId], (userError, usuario) => {
                if (userError) {
                    return res.status(500).json({ success: false, mensaje: "No se pudo verificar la cuenta." });
                }
                if (!usuario) {
                    return res.status(404).json({ success: false, mensaje: "No se encontró la cuenta." });
                }

                db.get("SELECT id FROM comunidad WHERE id = ?", [publicacionId], (postError, publicacion) => {
                    if (postError) {
                        return res.status(500).json({ success: false, mensaje: "No se pudo consultar la publicación." });
                    }
                    if (!publicacion) {
                        return res.status(404).json({ success: false, mensaje: "No se encontró la publicación." });
                    }

                    db.run(
                        `INSERT INTO comunidad_comentarios(publicacion_id, usuario_id, contenido)
                         VALUES(?, ?, ?)`,
                        [publicacionId, usuarioId, contenido],
                        function (insertError) {
                            if (insertError) {
                                return res.status(500).json({
                                    success: false,
                                    mensaje: "No se pudo guardar el comentario."
                                });
                            }

                            return res.status(201).json({
                                success: true,
                                mensaje: "Comentario publicado.",
                                id: this.lastID
                            });
                        }
                    );
                });
            });
        });

        app.post("/comunidad/comentarios/:comentarioId/like", (req, res) => {
            const comentarioId = Number(req.params.comentarioId);
            const usuarioId = Number(req.body?.usuarioId);

            if (!Number.isInteger(comentarioId) || comentarioId < 1
                || !Number.isInteger(usuarioId) || usuarioId < 1) {
                return res.status(400).json({ success: false, mensaje: "El comentario o la cuenta no son válidos." });
            }

            db.get("SELECT id FROM usuarios WHERE id = ?", [usuarioId], (userError, usuario) => {
                if (userError) {
                    return res.status(500).json({ success: false, mensaje: "No se pudo verificar la cuenta." });
                }
                if (!usuario) {
                    return res.status(404).json({ success: false, mensaje: "No se encontró la cuenta." });
                }

                db.get("SELECT id FROM comunidad_comentarios WHERE id = ?", [comentarioId], (commentError, comentario) => {
                    if (commentError) {
                        return res.status(500).json({ success: false, mensaje: "No se pudo consultar el comentario." });
                    }
                    if (!comentario) {
                        return res.status(404).json({ success: false, mensaje: "No se encontró el comentario." });
                    }

                    db.run(
                        `INSERT OR IGNORE INTO comunidad_comentarios_likes(comentario_id, usuario_id)
                         VALUES(?, ?)`,
                        [comentarioId, usuarioId],
                        (likeError) => {
                            if (likeError) {
                                return res.status(500).json({ success: false, mensaje: "No se pudo dar like." });
                            }

                            return res.json({ success: true, mensaje: "Like guardado." });
                        }
                    );
                });
            });
        });

        app.delete("/comunidad/comentarios/:comentarioId/like", (req, res) => {
            const comentarioId = Number(req.params.comentarioId);
            const usuarioId = Number(req.query.usuarioId);

            if (!Number.isInteger(comentarioId) || comentarioId < 1
                || !Number.isInteger(usuarioId) || usuarioId < 1) {
                return res.status(400).json({ success: false, mensaje: "El comentario o la cuenta no son válidos." });
            }

            db.run(
                "DELETE FROM comunidad_comentarios_likes WHERE comentario_id = ? AND usuario_id = ?",
                [comentarioId, usuarioId],
                (err) => {
                    if (err) {
                        return res.status(500).json({ success: false, mensaje: "No se pudo quitar el like." });
                    }

                    return res.json({ success: true, mensaje: "Like quitado." });
                }
            );
        });
    }

    app.post(`/${ruta}`, (req, res) => {
        const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
        const description = typeof req.body?.description === "string" ? req.body.description.trim() : "";

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                mensaje: "El título y la descripción son obligatorios."
            });
        }

        const tag = typeof req.body.tag === "string" ? req.body.tag.trim() : "";
        const meta = typeof req.body.meta === "string" ? req.body.meta.trim() : "";
        const accent = typeof req.body.accent === "string" ? req.body.accent.trim() : "";

        db.run(
            `INSERT INTO ${tabla}(title, tag, description, meta, accent)
             VALUES(?, ?, ?, ?, ?)`,
            [title, tag, description, meta, accent],
            function (err) {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        mensaje: `Error al crear en ${ruta}`,
                        error: err.message
                    });
                }

                return res.status(201).json({
                    success: true,
                    mensaje: "Contenido creado correctamente.",
                    id: this.lastID
                });
            }
        );
    });

    app.put(`/${ruta}/:id`, (req, res) => {
        const { id } = req.params;
        const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
        const description = typeof req.body?.description === "string" ? req.body.description.trim() : "";

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                mensaje: "El título y la descripción son obligatorios."
            });
        }

        const tag = typeof req.body.tag === "string" ? req.body.tag.trim() : "";
        const meta = typeof req.body.meta === "string" ? req.body.meta.trim() : "";
        const accent = typeof req.body.accent === "string" ? req.body.accent.trim() : "";

        db.run(
            `UPDATE ${tabla}
             SET title = ?, tag = ?, description = ?, meta = ?, accent = ?
             WHERE id = ?`,
            [title, tag, description, meta, accent, id],
            function (err) {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        mensaje: `Error al actualizar ${ruta}`,
                        error: err.message
                    });
                }

                if (this.changes === 0) {
                    return res.status(404).json({
                        success: false,
                        mensaje: "Contenido no encontrado."
                    });
                }

                return res.json({
                    success: true,
                    mensaje: "Contenido actualizado correctamente."
                });
            }
        );
    });

    app.delete(`/${ruta}/:id`, (req, res) => {
        const { id } = req.params;

        db.run(`DELETE FROM ${tabla} WHERE id = ?`, [id], function (err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    mensaje: `Error al eliminar de ${ruta}`,
                    error: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    mensaje: "Contenido no encontrado."
                });
            }

            return res.json({
                success: true,
                mensaje: "Contenido eliminado correctamente."
            });
        });
    });
};

crearRutasDeContenido("noticias", "noticias", "noticias");
crearRutasDeContenido("comunidad", "comunidad", "publicaciones");

databaseReady
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor iniciado en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("No se pudo inicializar la base de datos:", error.message);
    process.exitCode = 1;
  });