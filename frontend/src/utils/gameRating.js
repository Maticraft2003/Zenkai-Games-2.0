export function obtenerPuntuacionJuego(juego) {
  const likes = Math.max(0, Number(juego?.likes) || 0);
  const dislikes = Math.max(0, Number(juego?.dislikes) || 0);
  const votos = likes + dislikes;

  return votos > 0 ? Math.round((likes / votos) * 100) / 10 : null;
}

export function formatearPuntuacionJuego(puntuacion) {
  return puntuacion === null ? "Sin votos" : `${puntuacion.toFixed(1)}/10`;
}
