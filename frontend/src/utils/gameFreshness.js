const CUATRO_DIAS_MS = 4 * 24 * 60 * 60 * 1000;

export function diasRestantesComoNuevo(createdAt, now = Date.now()) {
  if (typeof createdAt !== "string" || !createdAt.trim()) return 0;

  const fechaNormalizada = createdAt.includes("T")
    ? createdAt
    : `${createdAt.replace(" ", "T")}Z`;
  const fechaCreacion = Date.parse(fechaNormalizada);
  const antiguedad = now - fechaCreacion;

  if (!Number.isFinite(fechaCreacion) || antiguedad < 0 || antiguedad >= CUATRO_DIAS_MS) {
    return 0;
  }

  return Math.ceil((CUATRO_DIAS_MS - antiguedad) / (24 * 60 * 60 * 1000));
}
