import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

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
                            etiqueta TEXT,
                            imagen TEXT,
                            descripcion TEXT
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
                                                accent TEXT
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

                                                                                                                resolverInicializacion();
                                                                                                            } catch (passwordMigrationError) {
                                                                                                                rechazarInicializacion(passwordMigrationError);
                                                                                                            }
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
                            };

                            db.all("PRAGMA table_info(juegos)", (tableError, columns) => {
                                if (tableError) {
                                    rechazarInicializacion(tableError);
                                    return;
                                }

                                const asegurarCatalogKey = () => {
                                    if (columns.some((column) => column.name === "catalog_key")) {
                                        inicializarTablasDeContenido();
                                        return;
                                    }

                                    db.run("ALTER TABLE juegos ADD COLUMN catalog_key TEXT", (migrationError) => {
                                        if (migrationError) {
                                            rechazarInicializacion(migrationError);
                                            return;
                                        }

                                        inicializarTablasDeContenido();
                                    });
                                };

                                if (columns.some((column) => column.name === "etiqueta")) {
                                    asegurarCatalogKey();
                                    return;
                                }

                                db.run("ALTER TABLE juegos ADD COLUMN etiqueta TEXT", (migrationError) => {
                                    if (migrationError) {
                                        rechazarInicializacion(migrationError);
                                        return;
                                    }

                                    asegurarCatalogKey();
                                });
                            });
                        }
                    );
                }
            );
        }
    );
});

export default db;