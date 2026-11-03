export function crearHeadersAutenticacion(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
