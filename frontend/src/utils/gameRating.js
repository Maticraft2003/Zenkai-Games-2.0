export function obtenerPuntuacionJuego(juego) {
  const puntuacion = Number(juego?.puntuacion_comunidad);
  return juego?.puntuacion_comunidad !== null && Number.isFinite(puntuacion)
    ? Math.round(puntuacion * 10) / 10
    : null;
}

export function formatearPuntuacionJuego(puntuacion) {
  return puntuacion === null ? "Sin calificaciones" : `${puntuacion.toFixed(1)}/5`;
}
