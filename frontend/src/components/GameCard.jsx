import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import FavoriteButton from "./FavoriteButton";
import GameVoteButtons from "./GameVoteButtons";
import { obtenerDescripcionJuego } from "../data/gameCatalog";
import { normalizarClaveJuego } from "../utils/gameKey";
import { formatearPuntuacionJuego, obtenerPuntuacionJuego } from "../utils/gameRating";

function GameCard({ juego, onEdit, onDelete }) {
  const navigate = useNavigate();
  const datos = juego ?? {};
  const [estadisticasJuego, setEstadisticasJuego] = useState({
    visitas: datos.visitas,
    likes: datos.likes,
    dislikes: datos.dislikes,
  });
  const puntuacionJuego = obtenerPuntuacionJuego(estadisticasJuego);
  const descripcion = datos.descripcion?.trim()
    || obtenerDescripcionJuego(datos.nombre)
    || "Todavía no hay una descripción disponible para este juego.";
  const [expandida, setExpandida] = useState(false);
  const actualizarVotos = useCallback((juegoActualizado) => {
    setEstadisticasJuego({
      visitas: juegoActualizado.visitas,
      likes: juegoActualizado.likes,
      dislikes: juegoActualizado.dislikes,
    });
  }, []);
  const mostrarValor = (valor) => (
    valor === undefined || valor === null || valor === "" ? "Sin datos" : String(valor)
  );

  const estadisticas = [
    { label: "Visitas", value: mostrarValor(estadisticasJuego.visitas) },
    { label: "Me gusta", value: mostrarValor(estadisticasJuego.likes) },
    { label: "No me gusta", value: mostrarValor(estadisticasJuego.dislikes) },
  ];

  const detalles = [
    { label: "Género", value: datos.genero },
    { label: "Etiqueta", value: datos.etiqueta },
    { label: "Plataforma", value: datos.plataforma },
    { label: "Jugadores", value: datos.jugadores },
    { label: "Dificultad", value: datos.dificultad },
    { label: "Visitas", value: estadisticasJuego.visitas },
    { label: "Me gusta", value: estadisticasJuego.likes },
    { label: "No me gusta", value: estadisticasJuego.dislikes },
    { label: "Puntuación", value: formatearPuntuacionJuego(puntuacionJuego) },
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
        <FavoriteButton juego={datos} overlay />
      </div>

      <div className="game-card-info">
        <div className="game-card-topline">
          <span className="game-card-genre">{datos.genero || "Sin género"}</span>
          <span className="game-card-score" aria-label={`Puntuación: ${formatearPuntuacionJuego(puntuacionJuego)}`}>
            ⭐ {formatearPuntuacionJuego(puntuacionJuego)}
          </span>
        </div>

        <h3>{datos.nombre || "Juego sin nombre"}</h3>

        <p className="game-card-description">
          {descripcion}
        </p>

        {!expandida ? (
          <button
            type="button"
            className="secondary-button game-detail-link"
            disabled={!datos.nombre}
            onClick={(evento) => {
              evento.stopPropagation();
              const gameKey = normalizarClaveJuego(datos.nombre);
              navigate(`/juego/${encodeURIComponent(gameKey)}`, { state: { juego: datos } });
            }}
          >
            Ver página del juego
          </button>
        ) : null}

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

        <GameVoteButtons
          juego={{ ...datos, ...estadisticasJuego }}
          compact
          onStatsChange={actualizarVotos}
        />

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
          <section className="home-expanded-game-details" aria-label={`Información completa de ${datos.nombre || "este juego"}`}>
            {detalles.map((detalle) => (
              <div key={detalle.label}>
                <span>{detalle.label}</span>
                <strong>{mostrarValor(detalle.value)}</strong>
              </div>
            ))}
            <div className="home-expanded-description">
              <span>Descripción</span>
              <p>{descripcion}</p>
            </div>
            <div className="home-expanded-actions">
              <span>Acciones</span>
              <button
                type="button"
                className="secondary-button game-detail-link"
                disabled={!datos.nombre}
                onClick={(evento) => {
                  evento.stopPropagation();
                  const gameKey = normalizarClaveJuego(datos.nombre);
                  navigate(`/juego/${encodeURIComponent(gameKey)}`, { state: { juego: datos } });
                }}
              >
                Ver página del juego
              </button>
              <span className="home-expanded-favorite-hint">
                Usá la estrella de la portada para guardar o quitar este juego de favoritos.
              </span>
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}

export default GameCard;