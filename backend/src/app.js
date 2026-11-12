import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

// Limitador sencillo por IP para proteger especialmente login y registro.
// En despliegues con varias instancias, reemplazar por un store compartido.
const buckets = new Map();
app.use((req, res, next) => {
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || now - current.start >= 15 * 60 * 1000) {
    buckets.set(key, { start: now, count: 1 });
  } else {
    current.count += 1;
    if (current.count > 300) {
      return res.status(429).json({ success: false, mensaje: "Demasiadas solicitudes. Intentá nuevamente más tarde." });
    }
  }
  next();
});

app.get("/", (req, res) => res.json({ success: true, mensaje: "Backend de Zenkai Games funcionando." }));
app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);
export default app;
