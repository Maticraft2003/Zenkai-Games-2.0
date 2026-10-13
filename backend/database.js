import sqlite3 from "sqlite3";
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

                            db.all("PRAGMA table_info(juegos)", (tableError, columns) => {
                                if (tableError) {
                                    rechazarInicializacion(tableError);
                                    return;
                                }

                                if (columns.some((column) => column.name === "etiqueta")) {
                                    resolverInicializacion();
                                    return;
                                }

                                db.run("ALTER TABLE juegos ADD COLUMN etiqueta TEXT", (migrationError) => {
                                    if (migrationError) {
                                        rechazarInicializacion(migrationError);
                                        return;
                                    }

                                    resolverInicializacion();
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