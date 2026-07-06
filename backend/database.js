import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./zenkai.db", (err) => {
    if (err) {
        console.log("Error al conectar con SQLite:", err.message);
    } else {
        console.log("✅ Base de datos conectada");

        db.run(`
            CREATE TABLE IF NOT EXISTS usuarios(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        `);
        db.run(
            `INSERT OR IGNORE INTO usuarios(email,password)
             VALUES(?,?)`,
             ["admin@gmail.com", "123456"]
        );
    }
});

export default db;