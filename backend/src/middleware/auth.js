import jwt from "jsonwebtoken";
import { get } from "../../database.js";

export async function authenticate(req, res, next) {
  try {
    const [scheme, token] = (req.headers.authorization || "").split(" ");
    if (scheme !== "Bearer" || !token) return res.status(401).json({ success:false, mensaje:"Iniciá sesión para continuar." });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await get("SELECT id, username, email, role FROM usuarios WHERE id = ?", [payload.sub]);
    if (!usuario) return res.status(401).json({ success:false, mensaje:"La sesión ya no es válida." });
    req.usuario = usuario;
    next();
  } catch { return res.status(401).json({ success:false, mensaje:"Token inválido o vencido." }); }
}
