import { useState } from "react";

function GameCard({ juego }) {
  const datos = juego ?? {};
  const puntuacion = typeof datos.puntuacion === "number" ? datos.puntuacion : 0;
  const [expandida, setExpandida] = useState(false);

  const estadisticas = [
    { label: "Puntuación", value: `⭐ ${puntuacion.toFixed(1)}` },
    { label: "Jugadores", value: datos.jugadores || "1-4" },
    { label: "Dificultad", value: datos.dificultad || "Media" },
  ];

  return (
    <article
      className={`game-card ${expandida ? "expanded" : ""}`}
      role="group"
      aria-expanded={expandida}
      onClick={() => setExpandida((actual) => !actual)}
    >
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

        <button
          type="button"
          className="expand-hint"
          aria-expanded={expandida}
          onClick={(evento) => {
            evento.stopPropagation();
            setExpandida((actual) => !actual);
          }}
        >
          {expandida ? "Contraer información" : "Ver toda la información"}
        </button>

        {expandida ? (
          <div className="home-expanded-game-details">
            <div>
              <span>Etiqueta</span>
              <strong>{datos.etiqueta || "Sin etiqueta"}</strong>
            </div>
            <div>
              <span>Género</span>
              <strong>{datos.genero || "Sin género"}</strong>
            </div>
            {datos.plataforma ? (
              <div>
                <span>Plataforma</span>
                <strong>{datos.plataforma}</strong>
              </div>
            ) : null}
            <div className="home-expanded-description">
              <span>Descripción</span>
              <p>{datos.descripcion || "Sin descripción disponible."}</p>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default GameCard;