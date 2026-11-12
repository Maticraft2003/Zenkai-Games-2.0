import "dotenv/config";
import app from "./src/app.js";
import { initializeDatabase } from "./database.js";

const PORT = process.env.PORT || 3001;
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET debe existir en .env y tener al menos 32 caracteres.");
}
await initializeDatabase();
app.listen(PORT, () => console.log(`Servidor iniciado en http://localhost:${PORT}`));
