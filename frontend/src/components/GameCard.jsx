function GameCard({ juego }) {
  return (
    <article className="game-card">

      <div className="game-card-image">
        <img src={juego.imagen} alt={juego.nombre} />
      </div>

      <div className="game-card-info">
        <span>{juego.genero}</span>

        <h3>{juego.nombre}</h3>

        <p>
          Puntuación: ⭐ {juego.puntuacion}
        </p>
      </div>

    </article>
  );
}

export default GameCard;