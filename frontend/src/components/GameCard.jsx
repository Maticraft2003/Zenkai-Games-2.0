import { useState } from "react";
import FavoriteButton from "./FavoriteButton";

function GameCard({ juego, onEdit, onDelete }) {
  const datos = juego ?? {};
  const puntuacion = datos.puntuacion === null || datos.puntuacion === undefined || datos.puntuacion === ""
    ? null
    : Number(datos.puntuacion);
  const puntuacionValida = Number.isFinite(puntuacion) ? puntuacion : null;
  const [expandida, setExpandida] = useState(false);

  const estadisticas = [
    ...(puntuacionValida === null ? [] : [{ label: "Puntuación", value: `⭐ ${puntuacionValida.toFixed(1)}` }]),
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
        {datos.etiqueta ? <span className="game-card-tag">{datos.etiqueta}</span> : null}
      </div>

      <div className="game-card-info">
        <div className="game-card-topline">
          <span className="game-card-genre">{datos.genero || "Sin género"}</span>
          {puntuacionValida === null ? null : (
            <span className="game-card-score">{puntuacionValida.toFixed(1)}</span>
          )}
        </div>

        <FavoriteButton juego={datos} overlay={Boolean(datos.imagen)} />
        <h3>{datos.nombre || "Juego sin nombre"}</h3>

        <p className="game-card-description">
          {datos.descripcion || "Un título con gran nivel de entretenimiento y comunidad."}
        </p>

        {onEdit || onDelete ? (
          <div className="crud-actions game-card-actions">
            {onEdit ? (
              <button
                type="button"
                className="secondary-button"
                onClick={(evento) => {
                  evento.stopPropagation();
                  onEdit(datos);
                }}
              >
                Editar
              </button>
            ) : null}
            {onDelete ? (
              <button
                type="button"
                className="logout-button danger-button"
                onClick={(evento) => {
                  evento.stopPropagation();
                  onDelete(datos);
                }}
              >
                Eliminar
              </button>
            ) : null}
          </div>
        ) : null}

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
            {datos.etiqueta ? (
              <div>
                <span>Etiqueta</span>
                <strong>{datos.etiqueta}</strong>
              </div>
            ) : null}
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