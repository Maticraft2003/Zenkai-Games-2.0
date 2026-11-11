import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { normalizarClaveJuego } from "./gameKeys.js";

const databasePath = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "zenkai.db"
);

let resolverInicializacion;
let rechazarInicializacion;

export const databaseReady = new Promise((resolveReady, rejectReady) => {
    resolverInicializacion = resolveReady;
    rechazarInicializacion = rejectReady;
});

const db = new sqlite3.Database(databasePath, (connectionError) => {
    if (connectionError) {
        rechazarInicializacion(connectionError);
        return;
    }

    console.log("✅ Base de datos conectada");

    db.run(
        `CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`,
        (userTableError) => {
            if (userTableError) {
                rechazarInicializacion(userTableError);
                return;
            }

            db.run(
                `INSERT OR IGNORE INTO usuarios(username, email, password)
                 VALUES (?, ?, ?)`,
                ["admin", "admin@gmail.com", "123456"],
                (seedError) => {
                    if (seedError) {
                        rechazarInicializacion(seedError);
                        return;
                    }

                    db.run(
                        `CREATE TABLE IF NOT EXISTS juegos (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            nombre TEXT NOT NULL,
                            genero TEXT NOT NULL,
                            puntuacion REAL,
                            plataforma TEXT,
                            plataformas TEXT NOT NULL DEFAULT '[]',
                            jugadores TEXT NOT NULL DEFAULT '',
                            rawg_id INTEGER,
                            etiqueta TEXT,
                            imagen TEXT,
                            descripcion TEXT,
                            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                        )`,
                        (gameTableError) => {
                            if (gameTableError) {
                                rechazarInicializacion(gameTableError);
                                return;
                            }

                            const inicializarTablasDeContenido = () => {
                                db.run(
                                    `CREATE TABLE IF NOT EXISTS noticias (
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        title TEXT NOT NULL,
                                        tag TEXT,
                                        description TEXT NOT NULL,
                                        meta TEXT,
                                        accent TEXT
                                    )`,
                                    (newsTableError) => {
                                        if (newsTableError) {
                                            rechazarInicializacion(newsTableError);
                                            return;
                                        }

                                        db.run(
                                            `CREATE TABLE IF NOT EXISTS comunidad (
                                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                title TEXT NOT NULL,
                                                tag TEXT,
                                                description TEXT NOT NULL,
                                                meta TEXT,
                                                accent TEXT,
                                                owner_user_id INTEGER
                                            )`,
                                            (communityTableError) => {
                                                if (communityTableError) {
                                                    rechazarInicializacion(communityTableError);
                                                    return;
                                                }

                                                db.run(
                                                    `CREATE TABLE IF NOT EXISTS comunidad_comentarios (
                                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                        publicacion_id INTEGER NOT NULL,
                                                        usuario_id INTEGER NOT NULL,
                                                        contenido TEXT NOT NULL,
                                                        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                    )`,
                                                    (commentsTableError) => {
                                                        if (commentsTableError) {
                                                            rechazarInicializacion(commentsTableError);
                                                            return;
                                                        }

                                                        db.run(
                                                            `CREATE TABLE IF NOT EXISTS comunidad_comentarios_likes (
                                                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                                comentario_id INTEGER NOT NULL,
                                                                usuario_id INTEGER NOT NULL,
                                                                UNIQUE(comentario_id, usuario_id)
                                                            )`,
                                                            (commentLikesTableError) => {
                                                                if (commentLikesTableError) {
                                                                    rechazarInicializacion(commentLikesTableError);
                                                                    return;
                                                                }

                                                                db.run(
                                                                    `CREATE TRIGGER IF NOT EXISTS limpiar_comentarios_comunidad
                                                                     AFTER DELETE ON comunidad
                                                                     BEGIN
                                                                        DELETE FROM comunidad_comentarios_likes
                                                                        WHERE comentario_id IN (
                                                                            SELECT id FROM comunidad_comentarios WHERE publicacion_id = OLD.id
                                                                        );
                                                                        DELETE FROM comunidad_comentarios WHERE publicacion_id = OLD.id;
                                                                     END`,
                                                                    (commentsCleanupTriggerError) => {
                                                                        if (commentsCleanupTriggerError) {
                                                                            rechazarInicializacion(commentsCleanupTriggerError);
                                                                            return;
                                                                        }

                                                                        db.run(
                                                                            `CREATE TABLE IF NOT EXISTS favoritos (
                                                                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                                                usuario_id INTEGER NOT NULL,
                                                                                juego_key TEXT NOT NULL,
                                                                                nombre TEXT NOT NULL,
                                                                                genero TEXT,
                                                                                imagen TEXT,
                                                                                descripcion TEXT,
                                                                                UNIQUE(usuario_id, juego_key)
                                                                            )`,
                                                                            (favoritesTableError) => {
                                                                                if (favoritesTableError) {
                                                                                    rechazarInicializacion(favoritesTableError);
                                                                                    return;
                                                                                }

                                                                                db.run(
                                                                                    `CREATE TABLE IF NOT EXISTS juegos_catalogo_ocultos (
                                                                                        juego_key TEXT PRIMARY KEY
                                                                                    )`,
                                                                                    (hiddenCatalogError) => {
                                                                                        if (hiddenCatalogError) {
                                                                                            rechazarInicializacion(hiddenCatalogError);
                                                                                            return;
                                                                                        }

                                                                                        db.run(
                                                                                            `CREATE TABLE IF NOT EXISTS juegos_visitas (
                                                                                                juego_key TEXT PRIMARY KEY,
                                                                                                nombre TEXT NOT NULL,
                                                                                                genero TEXT,
                                                                                                imagen TEXT,
                                                                                                descripcion TEXT,
                                                                                                visitas INTEGER NOT NULL DEFAULT 0
                                                                                            )`,
                                                                                            (gameVisitsTableError) => {
                                                                                                if (gameVisitsTableError) {
                                                                                                    rechazarInicializacion(gameVisitsTableError);
                                                                                                    return;
                                                                                                }

                                                                                                db.run(
                                                                                                    `CREATE TABLE IF NOT EXISTS juegos_visitas_unicas (
                                                                                                        juego_key TEXT NOT NULL,
                                                                                                        visitante_key TEXT NOT NULL,
                                                                                                        PRIMARY KEY(juego_key, visitante_key)
                                                                                                    )`,
                                                                                                    (uniqueVisitsTableError) => {
                                                                                                        if (uniqueVisitsTableError) {
                                                                                                            rechazarInicializacion(uniqueVisitsTableError);
                                                                                                            return;
                                                                                                        }

                                                                                                        db.run(
                                                                                                            `CREATE TABLE IF NOT EXISTS juegos_likes (
                                                                                                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                                                                                juego_key TEXT NOT NULL,
                                                                                                                usuario_id INTEGER NOT NULL,
                                                                                                                UNIQUE(juego_key, usuario_id)
                                                                                                            )`,
                                                                                                            (gameLikesTableError) => {
                                                                                                        if (gameLikesTableError) {
                                                                                                            rechazarInicializacion(gameLikesTableError);
                                                                                                            return;
                                                                                                        }

                                                                                                        db.run(
                                                                                                            `CREATE TABLE IF NOT EXISTS juegos_dislikes (
                                                                                                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                                                                                juego_key TEXT NOT NULL,
                                                                                                                usuario_id INTEGER NOT NULL,
                                                                                                                UNIQUE(juego_key, usuario_id)
                                                                                                            )`,
                                                                                                            (gameDislikesTableError) => {
                                                                                                        if (gameDislikesTableError) {
                                                                                                            rechazarInicializacion(gameDislikesTableError);
                                                                                                            return;
                                                                                                        }

                                                                                                        inicializarTablasAuth(db, (authError) => {
                                                                                                            if (authError) {
                                                                                                                rechazarInicializacion(authError);
                                                                                                                return;
                                                                                                            }
                                                                                                        db.all("SELECT id, password FROM usuarios", async (usersError, users) => {
                                                                                                            if (usersError) {
                                                                                                                rechazarInicializacion(usersError);
                                                                                                                return;
                                                                                                            }

                                                                                                            try {
                                                                                                                const legacyUsers = users.filter(
                                                                                                                    (user) => !/^\$2[aby]\$/.test(user.password)
                                                                                                                );

                                                                                                                await Promise.all(legacyUsers.map(async (user) => {
                                                                                                                    const hashedPassword = await bcrypt.hash(user.password, 12);
                                                                                                                    await new Promise((resolveUpdate, rejectUpdate) => {
                                                                                                                        db.run(
                                                                                                                            "UPDATE usuarios SET password = ? WHERE id = ?",
                                                                                                                            [hashedPassword, user.id],
                                                                                                                            (updateError) => {
                                                                                                                                if (updateError) rejectUpdate(updateError);
                                                                                                                                else resolveUpdate();
                                                                                                                            }
                                                                                                                        );
                                                                                                                    });
                                                                                                                }));

                                                                                                                db.all("PRAGMA table_info(comunidad)", (communityColumnsError, columns) => {
                                                                                                                    if (communityColumnsError) {
                                                                                                                        rechazarInicializacion(communityColumnsError);
                                                                                                                        return;
                                                                                                                    }

                                                                                                                    if (columns.some((column) => column.name === "owner_user_id")) {
                                                                                                                        resolverInicializacion();
                                                                                                                        return;
                                                                                                                    }

                                                                                                                    db.run(
                                                                                                                        "ALTER TABLE comunidad ADD COLUMN owner_user_id INTEGER",
                                                                                                                        (ownerColumnError) => {
                                                                                                                            if (ownerColumnError) {
                                                                                                                                rechazarInicializacion(ownerColumnError);
                                                                                                                                return;
                                                                                                                            }
                                                                                                                            resolverInicializacion();
                                                                                                                        }
                                                                                                                    );
                                                                                                                });
                                                                                                            } catch (passwordMigrationError) {
                                                                                                                rechazarInicializacion(passwordMigrationError);
                                                                                                            }
                                                                                                        });
                                        });
                                                                    }
                                                                );
                                                                                            }
                                                                                        );
                                                                                    }
                                                                                );
                                                                            }
                                                                        );
                                                                    }
                                                                );
                                                            }
                                                        );
                                                    }
                                                );
                                            }
                                        );
                                            }
                                        );
                                            }
                                        );
                                            }
                                        );
                            };

                            db.all("PRAGMA table_info(juegos)", (tableError, columns) => {
                                if (tableError) {
                                    rechazarInicializacion(tableError);
                                    return;
                                }

                                const asegurarNombreKey = () => {
                                    const columnasNuevas = [
                                        ["plataformas", "TEXT NOT NULL DEFAULT '[]'"],
                                        ["jugadores", "TEXT NOT NULL DEFAULT ''"],
                                        ["rawg_id", "INTEGER"],
                                    ];

                                    const asegurarColumnasNuevas = (indice = 0) => {
                                        if (indice >= columnasNuevas.length) {
                                            crearIndiceUnico();
                                            return;
                                        }

                                        const [nombreColumna, definicion] = columnasNuevas[indice];
                                        if (columns.some((column) => column.name === nombreColumna)) {
                                            asegurarColumnasNuevas(indice + 1);
                                            return;
                                        }

                                        db.run(
                                            `ALTER TABLE juegos ADD COLUMN ${nombreColumna} ${definicion}`,
                                            (columnError) => {
                                                if (columnError) {
                                                    rechazarInicializacion(columnError);
                                                    return;
                                                }
                                                asegurarColumnasNuevas(indice + 1);
                                            }
                                        );
                                    };

                                    const crearIndiceUnico = () => {
                                        db.all("SELECT id, nombre FROM juegos", (gamesError, games) => {
                                            if (gamesError) {
                                                rechazarInicializacion(gamesError);
                                                return;
                                            }

                                            const actualizarClave = (indice) => {
                                                if (indice >= games.length) {
                                                    db.run(
                                                        "CREATE UNIQUE INDEX IF NOT EXISTS idx_juegos_nombre_key ON juegos(nombre_key)",
                                                        (indexError) => {
                                                            if (indexError) {
                                                                rechazarInicializacion(indexError);
                                                                return;
                                                            }
                                                            inicializarTablasDeContenido();
                                                        }
                                                    );
                                                    return;
                                                }

                                                const juego = games[indice];
                                                db.run(
                                                    "UPDATE juegos SET nombre_key = ? WHERE id = ? AND nombre_key IS NOT ?",
                                                    [normalizarClaveJuego(juego.nombre), juego.id, normalizarClaveJuego(juego.nombre)],
                                                    (updateError) => {
                                                        if (updateError) {
                                                            rechazarInicializacion(updateError);
                                                            return;
                                                        }
                                                        actualizarClave(indice + 1);
                                                    }
                                                );
                                            };

                                            actualizarClave(0);
                                        });
                                    };

                                    if (columns.some((column) => column.name === "nombre_key")) {
                                        asegurarColumnasNuevas();
                                        return;
                                    }

                                    db.run("ALTER TABLE juegos ADD COLUMN nombre_key TEXT", (migrationError) => {
                                        if (migrationError) {
                                            rechazarInicializacion(migrationError);
                                            return;
                                        }
                                        asegurarColumnasNuevas();
                                    });
                                };

                                const asegurarCatalogKey = () => {
                                    if (columns.some((column) => column.name === "catalog_key")) {
                                        asegurarNombreKey();
                                        return;
                                    }

                                    db.run("ALTER TABLE juegos ADD COLUMN catalog_key TEXT", (migrationError) => {
                                        if (migrationError) {
                                            rechazarInicializacion(migrationError);
                                            return;
                                        }
                                        asegurarNombreKey();
                                    });
                                };

                                const asegurarCreatedAt = () => {
                                    if (columns.some((column) => column.name === "created_at")) {
                                        asegurarCatalogKey();
                                        return;
                                    }

                                    db.run("ALTER TABLE juegos ADD COLUMN created_at TEXT", (migrationError) => {
                                        if (migrationError) {
                                            rechazarInicializacion(migrationError);
                                            return;
                                        }

                                        db.run(
                                            "UPDATE juegos SET created_at = '1970-01-01 00:00:00' WHERE created_at IS NULL",
                                            (backfillError) => {
                                                if (backfillError) {
                                                    rechazarInicializacion(backfillError);
                                                    return;
                                                }
                                                asegurarCatalogKey();
                                            }
                                        );
                                    });
                                };

                                if (columns.some((column) => column.name === "etiqueta")) {
                                    asegurarCreatedAt();
                                    return;
                                }

                                db.run("ALTER TABLE juegos ADD COLUMN etiqueta TEXT", (migrationError) => {
                                    if (migrationError) {
                                        rechazarInicializacion(migrationError);
                                        return;
                                    }

                                    asegurarCreatedAt();
                                });
                            });
                        }
                    );
                }
            );
        }
    );
});

function inicializarTablasAuth(database, callback) {
    const consultas = [
        (next) => database.run(
            `CREATE TABLE IF NOT EXISTS user_roles (
                user_id INTEGER PRIMARY KEY,
                role TEXT NOT NULL DEFAULT 'usuario'
            )`,
            next
        ),
        (next) => database.run(
            `CREATE TABLE IF NOT EXISTS auth_sessions (
                token_hash TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                expires_at TEXT NOT NULL
            )`,
            next
        ),
        (next) => database.run(
            `CREATE TABLE IF NOT EXISTS juegos_calificaciones (
                juego_key TEXT NOT NULL,
                usuario_id INTEGER NOT NULL,
                puntuacion INTEGER NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (juego_key, usuario_id)
            )`,
            next
        ),
        (next) => database.run(
            "INSERT OR IGNORE INTO user_roles(user_id) SELECT id FROM usuarios",
            next
        ),
        (next) => database.run(
            `UPDATE user_roles SET role = CASE
                WHEN user_id = (SELECT id FROM usuarios WHERE LOWER(email) = LOWER(?)) THEN 'admin'
                ELSE 'usuario'
            END`,
            ["matiasbeloso2003@gmail.com"],
            next
        ),
    ];

    const ejecutarSiguiente = (indice) => {
        if (indice === consultas.length) {
            callback(null);
            return;
        }

        consultas[indice]((error) => {
            if (error) {
                callback(error);
                return;
            }
            ejecutarSiguiente(indice + 1);
        });
    };

    ejecutarSiguiente(0);
}

export default db;