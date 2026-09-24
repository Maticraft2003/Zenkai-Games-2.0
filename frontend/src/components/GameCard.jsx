function GameCard({ juego }) {
  const datos = juego ?? {};
  const puntuacion = typeof datos.puntuacion === "number" ? datos.puntuacion : 0;

  const estadisticas = [
    { label: "Puntuación", value: `⭐ ${puntuacion.toFixed(1)}` },
    { label: "Jugadores", value: datos.jugadores || "1-4" },
    { label: "Dificultad", value: datos.dificultad || "Media" },
  ];

  return (
    <article className="game-card">
      <div className="game-card-image">
        <img src={datos.imagen} alt={datos.nombre || "Juego"} />
        <span className="game-card-tag">{datos.etiqueta || "Nuevo"}</span>
      </div>

      <div className="game-card-info">
        <div className="game-card-topline">
          <span className="game-card-genre">{datos.genero || "Sin género"}</span>
          <span className="game-card-score">{puntuacion.toFixed(1)}</span>
        </div>

        <h3>{datos.nombre || "Juego sin nombre"}</h3>

        <p className="game-card-description">
          {datos.descripcion || "Un título con gran nivel de entretenimiento y comunidad."}
        </p>

        <div className="game-card-stats">
          {estadisticas.map((stat) => (
            <div key={stat.label} className="game-stat">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export default GameCard;