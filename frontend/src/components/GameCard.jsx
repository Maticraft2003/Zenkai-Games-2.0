function GameCard({ juego }) {
  const estadisticas = [
    { label: "Puntuación", value: `⭐ ${juego.puntuacion.toFixed(1)}` },
    { label: "Jugadores", value: juego.jugadores || "1-4" },
    { label: "Dificultad", value: juego.dificultad || "Media" },
  ];

  return (
    <article className="game-card">
      <div className="game-card-image">
        <img src={juego.imagen} alt={juego.nombre} />
        <span className="game-card-tag">{juego.etiqueta}</span>
      </div>

      <div className="game-card-info">
        <div className="game-card-topline">
          <span className="game-card-genre">{juego.genero}</span>
          <span className="game-card-score">{juego.puntuacion.toFixed(1)}</span>
        </div>

        <h3>{juego.nombre}</h3>

        <p className="game-card-description">
          {juego.descripcion || "Un título con gran nivel de entretenimiento y comunidad."}
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