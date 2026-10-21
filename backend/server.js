import db, { databaseReady } from "./database.js";
import bcrypt from "bcrypt";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "8mb" }));

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
        ["imagen", 7 * 1024 * 1024, "La imagen"],
        ["descripcion", 10000, "La descripción"]
    ];

    for (const [campo, maximo, etiqueta] of limites) {
        if (datos[campo].trim().length > maximo) {
            return `${etiqueta} supera el máximo permitido de ${maximo} caracteres.`;
        }
    }

    return null;
};

// Ruta de prueba
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
        "SELECT id, username, email, password FROM usuarios WHERE email = ?",
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

            return res.json({
                success: true,
                mensaje: "Bienvenido",
                usuario: {
                  id: usuario.id,
                  username: usuario.username,
                  email: usuario.email
              }
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

              return res.status(201).json({
                  success: true,
                  mensaje: "Usuario creado correctamente.",
                  usuario: {
                      id: this.lastID,
                      username,
                      email
                  }
              });
            }
        );
    });
});

app.get("/perfil/:id", (req, res) => {
    const { id } = req.params;

    db.get(
        "SELECT id, username, email FROM usuarios WHERE id = ?",
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
        "SELECT id, username, email, password FROM usuarios WHERE id = ?",
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
                          usuario: { id: usuario.id, username, email }
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

// Obtener todos los juegos
app.get("/juegos", (req, res) => {
    db.all("SELECT * FROM juegos ORDER BY id DESC", (err, rows) => {
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

app.delete("/catalogo-juegos/:juegoKey", (req, res) => {
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

const normalizarClaveJuego = (nombre) => nombre
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();

app.get("/engagement/juegos/recomendados", (req, res) => {
    db.all(
        `SELECT visitas.juego_key, visitas.nombre, visitas.genero, visitas.imagen,
                visitas.descripcion, visitas.visitas,
                COUNT(juegos_likes.id) AS likes,
                visitas.visitas + COUNT(juegos_likes.id) AS interes_total
         FROM juegos_visitas AS visitas
         LEFT JOIN juegos_likes ON juegos_likes.juego_key = visitas.juego_key
         GROUP BY visitas.juego_key
         ORDER BY interes_total DESC, visitas.visitas DESC, visitas.nombre COLLATE NOCASE ASC
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

app.get("/engagement/juegos/:gameKey", (req, res) => {
    const gameKey = normalizarClaveJuego(req.params.gameKey || "");
    const usuarioId = Number(req.query.usuarioId);

    if (!gameKey) {
        return res.status(400).json({ success: false, mensaje: "El juego no es válido." });
    }

    db.get(
        `SELECT ? AS juego_key,
                (SELECT nombre FROM juegos_visitas WHERE juego_key = ?) AS nombre,
                (SELECT genero FROM juegos_visitas WHERE juego_key = ?) AS genero,
                (SELECT imagen FROM juegos_visitas WHERE juego_key = ?) AS imagen,
                (SELECT descripcion FROM juegos_visitas WHERE juego_key = ?) AS descripcion,
                COALESCE((SELECT visitas FROM juegos_visitas WHERE juego_key = ?), 0) AS visitas,
                (SELECT COUNT(*) FROM juegos_likes WHERE juego_key = ?) AS likes,
                EXISTS(
                    SELECT 1 FROM juegos_likes
                    WHERE juego_key = ? AND usuario_id = ?
                ) AS liked_by_user`,
        [
            gameKey,
            gameKey,
            gameKey,
            gameKey,
            gameKey,
            gameKey,
            gameKey,
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
    const genero = typeof req.body?.juego?.genero === "string" ? req.body.juego.genero.trim() : "";
    const imagen = typeof req.body?.juego?.imagen === "string" ? req.body.juego.imagen.trim() : "";
    const descripcion = typeof req.body?.juego?.descripcion === "string" ? req.body.juego.descripcion.trim() : "";
    const usuarioId = Number(req.body?.usuarioId);
    const usuarioIdValido = Number.isInteger(usuarioId) && usuarioId > 0 ? usuarioId : 0;

    if (!nombre || !gameKey || normalizarClaveJuego(nombre) !== gameKey) {
        return res.status(400).json({ success: false, mensaje: "No se pudo identificar el juego." });
    }

    db.run(
        `INSERT INTO juegos_visitas(juego_key, nombre, genero, imagen, descripcion, visitas)
         VALUES(?, ?, ?, ?, ?, 1)
         ON CONFLICT(juego_key) DO UPDATE SET
            nombre = excluded.nombre,
            genero = excluded.genero,
            imagen = excluded.imagen,
            descripcion = excluded.descripcion,
            visitas = juegos_visitas.visitas + 1`,
        [gameKey, nombre, genero, imagen, descripcion],
        (err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    mensaje: "No se pudo registrar la visita."
                });
            }

            db.get(
                `SELECT visitas.juego_key, visitas.nombre, visitas.genero, visitas.imagen,
                        visitas.descripcion, visitas.visitas,
                        (SELECT COUNT(*) FROM juegos_likes WHERE juego_key = visitas.juego_key) AS likes,
                        EXISTS(
                            SELECT 1 FROM juegos_likes
                            WHERE juego_key = visitas.juego_key AND usuario_id = ?
                        ) AS liked_by_user,
                        visitas.visitas + (
                            SELECT COUNT(*) FROM juegos_likes WHERE juego_key = visitas.juego_key
                        ) AS interes_total
                 FROM juegos_visitas AS visitas
                 WHERE visitas.juego_key = ?`,
                [usuarioIdValido, gameKey],
                (statsError, juego) => {
                    if (statsError) {
                        return res.status(500).json({
                            success: false,
                            mensaje: "La visita se registró, pero no se pudieron cargar las estadísticas."
                        });
                    }

                    return res.json({ success: true, juego });
                }
            );
        }
    );
});

app.post("/engagement/juegos/:gameKey/like", (req, res) => {
    const gameKey = normalizarClaveJuego(req.params.gameKey || "");
    const usuarioId = Number(req.body?.usuarioId);

    if (!gameKey || !Number.isInteger(usuarioId) || usuarioId < 1) {
        return res.status(400).json({ success: false, mensaje: "El juego o la cuenta no son válidos." });
    }

    db.get("SELECT id FROM usuarios WHERE id = ?", [usuarioId], (userError, usuario) => {
        if (userError) {
            return res.status(500).json({ success: false, mensaje: "No se pudo verificar la cuenta." });
        }
        if (!usuario) {
            return res.status(404).json({ success: false, mensaje: "No se encontró la cuenta." });
        }

        db.run(
            "INSERT OR IGNORE INTO juegos_likes(juego_key, usuario_id) VALUES(?, ?)",
            [gameKey, usuarioId],
            (likeError) => {
                if (likeError) {
                    return res.status(500).json({ success: false, mensaje: "No se pudo dar me gusta." });
                }

                return res.json({ success: true, mensaje: "Me gusta guardado." });
            }
        );
    });
});

app.delete("/engagement/juegos/:gameKey/like", (req, res) => {
    const gameKey = normalizarClaveJuego(req.params.gameKey || "");
    const usuarioId = Number(req.query.usuarioId);

    if (!gameKey || !Number.isInteger(usuarioId) || usuarioId < 1) {
        return res.status(400).json({ success: false, mensaje: "El juego o la cuenta no son válidos." });
    }

    db.run(
        "DELETE FROM juegos_likes WHERE juego_key = ? AND usuario_id = ?",
        [gameKey, usuarioId],
        (err) => {
            if (err) {
                return res.status(500).json({ success: false, mensaje: "No se pudo quitar el me gusta." });
            }

            return res.json({ success: true, mensaje: "Me gusta quitado." });
        }
    );
});

// Obtener un juego por ID
app.get("/juegos/:id", (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM juegos WHERE id = ?", [id], (err, juegos) => {
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
    });
});

// Crear un juego nuevo
app.post("/juegos", (req, res) => {
    const errorValidacion = validarDatosJuego(req.body);
    if (errorValidacion) {
        return res.status(400).json({ success: false, mensaje: errorValidacion });
    }

    const { nombre, genero, puntuacion, plataforma, etiqueta, imagen, descripcion } = req.body;
    const catalogKey = typeof req.body.catalogKey === "string" ? req.body.catalogKey : null;

    db.run(
        `
        INSERT INTO juegos(nombre, genero, puntuacion, plataforma, etiqueta, imagen, descripcion, catalog_key)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [nombre.trim(), genero.trim(), puntuacion, plataforma, etiqueta, imagen.trim(), descripcion.trim(), catalogKey],
        function (err) {
            if (err) {
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

// Editar un juego
app.put("/juegos/:id", (req, res) => {
    const errorValidacion = validarDatosJuego(req.body);
    if (errorValidacion) {
        return res.status(400).json({ success: false, mensaje: errorValidacion });
    }

    const { id } = req.params;
    const { nombre, genero, puntuacion, plataforma, etiqueta, imagen, descripcion } = req.body;
    const catalogKey = typeof req.body.catalogKey === "string" ? req.body.catalogKey : null;

    db.run(
        `
        UPDATE juegos
        SET nombre = ?, genero = ?, puntuacion = ?, plataforma = ?, etiqueta = ?, imagen = ?, descripcion = ?, catalog_key = ?
        WHERE id = ?
        `,
        [nombre.trim(), genero.trim(), puntuacion, plataforma, etiqueta, imagen.trim(), descripcion.trim(), catalogKey, id],
        function (err) {
            if (err) {
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
});

// Eliminar un juego
app.delete("/juegos/:id", (req, res) => {
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
    const juegoKey = nombre
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase();

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