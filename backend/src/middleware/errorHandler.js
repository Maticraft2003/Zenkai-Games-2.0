export function notFound(req, res) {
  res.status(404).json({ success:false, mensaje:"Ruta no encontrada." });
}
export function errorHandler(error, req, res, next) {
  console.error(error);
  const status = Number(error.status) || 500;
  res.status(status).json({ success:false, mensaje: status === 500 ? "Ocurrió un error interno." : error.message });
}
