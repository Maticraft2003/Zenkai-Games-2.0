import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const databasePath = path.join(__dirname, "zenkai.db");
const db = new sqlite3.Database(databasePath);
db.run("PRAGMA foreign_keys = ON");

export const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (error) {
    if (error) return reject(error);
    resolve({ lastID: this.lastID, changes: this.changes });
  });
});
export const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (error, row) => error ? reject(error) : resolve(row));
});
export const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows));
});

async function addColumnIfMissing(table, column, definition) {
  const columns = await all(`PRAGMA table_info(${table})`);
  if (!columns.some((item) => item.name === column)) {
    await run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

export async function initializeDatabase() {
  await run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);
  await run(`CREATE TABLE IF NOT EXISTS juegos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    genero TEXT NOT NULL,
    puntuacion REAL DEFAULT 0,
    plataforma TEXT DEFAULT '',
    imagen TEXT DEFAULT '',
    descripcion TEXT DEFAULT ''
  )`);

  await addColumnIfMissing("usuarios", "role", "TEXT NOT NULL DEFAULT 'user'");
  await addColumnIfMissing("juegos", "etiqueta", "TEXT DEFAULT ''");
  await addColumnIfMissing("juegos", "jugadores", "TEXT DEFAULT ''");
  await addColumnIfMissing("juegos", "rawg_id", "INTEGER");

  await run(`CREATE TABLE IF NOT EXISTS valoraciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    juego_id INTEGER NOT NULL,
    puntuacion INTEGER NOT NULL CHECK(puntuacion BETWEEN 1 AND 5),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, juego_id),
    FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY(juego_id) REFERENCES juegos(id) ON DELETE CASCADE
  )`);
  await run(`CREATE TABLE IF NOT EXISTS comentarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    contenido TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
  )`);
  await run(`CREATE TABLE IF NOT EXISTS noticias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    imagen TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await run("CREATE INDEX IF NOT EXISTS idx_valoraciones_juego ON valoraciones(juego_id)");

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail) {
    const existing = await get("SELECT id FROM usuarios WHERE lower(email) = ?", [adminEmail]);
    if (existing) {
      await run("UPDATE usuarios SET role = 'admin' WHERE id = ?", [existing.id]);
    } else if (adminPassword && adminPassword.length >= 10) {
      const hash = await bcrypt.hash(adminPassword, 12);
      await run("INSERT INTO usuarios(username, email, password, role) VALUES (?, ?, ?, 'admin')",
        [process.env.ADMIN_USERNAME || "Matias", adminEmail, hash]);
    } else {
      console.warn("ADMIN_EMAIL configurado. Para crear esa cuenta, agregá ADMIN_PASSWORD (mínimo 10 caracteres) al .env.");
    }
  }
  console.log("Base de datos Zenkai inicializada.");
}
export default db;
