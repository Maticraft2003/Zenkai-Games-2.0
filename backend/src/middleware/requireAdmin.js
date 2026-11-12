export function requireAdmin(req, res, next) {
  if (req.usuario?.role !== "admin") return res.status(403).json({ success:false, mensaje:"Esta acción está reservada al administrador." });
  next();
}
