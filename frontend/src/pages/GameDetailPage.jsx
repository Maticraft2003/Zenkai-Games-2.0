import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import FavoriteButton from "../components/FavoriteButton";
import GameVoteButtons from "../components/GameVoteButtons";
import ZenkaiNotice from "../components/ZenkaiNotice";
import catalogoJuegos, { buscarJuegoEnCatalogo, obtenerDescripcionJuego } from "../data/gameCatalog";
import { useAuth } from "../context/useAuth";
import { normalizarClaveJuego } from "../utils/gameKey";
import { formatearPuntuacionJuego, obtenerPuntuacionJuego } from "../utils/gameRating";
import "./Home.css";

function GameDetailPage() {
  const { gameKey = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const juegoDesdeNavegacion = location.state?.juego;
  const juegoCatalogo = catalogoJuegos.find(
    (juego) => normalizarClaveJuego(juego.nombre) === gameKey
  );
  const juegoInicial = juegoDesdeNavegacion || juegoCatalogo || null;
  const [juego, setJuego] = useState(juegoInicial);
  const [estadisticas, setEstadisticas] = useState({ visitas: 0, likes: 0, dislikes: 0 });
  const [juegoCargadoKey, setJuegoCargadoKey] = useState(null);
  const [error, setError] = useState("");
  const solicitudVisita = useRef({ gameKey: null, promise: null });
  const puntuacionJuego = obtenerPuntuacionJuego(estadisticas);
  const descripcionJuego = juego?.descripcion
    || obtenerDescripcionJuego(juego?.nombre)
    || "Todavía no hay una descripción para este juego.";

  useEffect(() => {
    let ignore = false;

    if (solicitudVisita.current.gameKey !== gameKey) {
      solicitudVisita.current = {
        gameKey,
        promise: (async () => {
          let datosJuego = juegoInicial;

          if (!datosJuego) {
            const respuestaEstadisticas = await axios.get(
              `http://localhost:3001/engagement/juegos/${encodeURIComponent(gameKey)}`
            );
            if (!respuestaEstadisticas.data?.success || !respuestaEstadisticas.data.juego) {
              throw new Error("No se pudieron obtener los datos del juego.");
            }

            const datosGuardados = respuestaEstadisticas.data.juego;
            if (datosGuardados.nombre) {
              datosJuego = datosGuardados;
            } else {
              datosJuego = buscarJuegoEnCatalogo(gameKey);
              if (!datosJuego) {
                const juegoNoEncontrado = new Error("Este juego no existe o ya no está disponible en Zenkai Games.");
                juegoNoEncontrado.code = "GAME_NOT_FOUND";
                throw juegoNoEncontrado;
              }
            }
          }

          const respuestaVisita = await axios.post(
            `http://localhost:3001/engagement/juegos/${encodeURIComponent(gameKey)}/visita`,
            { juego: datosJuego, usuarioId: usuario?.id }
          );
          if (!respuestaVisita.data?.success || !respuestaVisita.data.juego) {
            throw new Error("No se pudo registrar la visita al juego.");
          }

          return respuestaVisita.data.juego;
        })(),
      };
    }

    solicitudVisita.current.promise
      .then((datosJuego) => {
        if (!ignore) {
          setJuego(datosJuego);
          setJuegoCargadoKey(gameKey);
          setError("");
          setEstadisticas({
            visitas: Number(datosJuego.visitas) || 0,
            likes: Number(datosJuego.likes) || 0,
            dislikes: Number(datosJuego.dislikes) || 0,
          });
        }
      })
      .catch((visitaError) => {
        console.error("No se pudieron cargar las estadísticas del juego:", visitaError);
        if (!ignore) {
          setJuegoCargadoKey(gameKey);
          setError(
            visitaError.code === "GAME_NOT_FOUND" || visitaError.response?.status === 404
              ? "Este juego no existe o ya no está disponible en Zenkai Games."
              : "No se pudieron cargar los datos del juego. Intentá nuevamente."
          );
        }
      });

    return () => {
      ignore = true;
    };
  }, [gameKey, juegoInicial, usuario?.id]);

  const actualizarEstadisticas = useCallback((datosJuego) => {
    setEstadisticas({
      visitas: Number(datosJuego.visitas) || 0,
      likes: Number(datosJuego.likes) || 0,
      dislikes: Number(datosJuego.dislikes) || 0,
    });
  }, []);

  const cerrarSesion = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="home">
      <header className="navbar">
        <div className="navbar-logo">
          <span className="logo-icon">🎮</span>
          <span>Zenkai Games</span>
        </div>

        <nav className="navbar-menu">
          <button type="button" onClick={() => navigate("/home")}>Inicio</button>
          <button type="button" onClick={() => navigate("/juegos")}>Juegos</button>
          <button type="button" onClick={() => navigate("/rankings")}>Rankings</button>
          <button type="button" onClick={() => navigate("/favoritos")}>Favoritos</button>
        </nav>

        <div className="navbar-user">
          <button type="button" className="profile-button" onClick={() => navigate("/perfil")}>
            👤 Mi Perfil
          </button>
          <button type="button" className="logout-button" onClick={cerrarSesion}>
            🚪 Salir
          </button>
        </div>
      </header>

      <main className="game-detail-main">
        <button type="button" className="outline-button" onClick={() => navigate(-1)}>
          ← Volver
        </button>

        {error ? (
          <ZenkaiNotice title={error.includes("no existe") ? "JUEGO NO ENCONTRADO" : "ERROR DEL JUEGO"}>
            {error}
          </ZenkaiNotice>
        ) : null}
        {juegoCargadoKey !== gameKey ? (
          <div className="empty-games">Cargando juego...</div>
        ) : juego ? (
          <article className="game-detail-card">
            {juego.imagen ? (
              <div className="game-detail-image">
                <img src={juego.imagen} alt={`Carátula de ${juego.nombre}`} />
              </div>
            ) : null}
            <div className="game-detail-info">
              <p className="section-label">{juego.genero || "VIDEOJUEGO"}</p>
              <h1>{juego.nombre}</h1>
              <span className="game-card-score" aria-label={`Puntuación: ${formatearPuntuacionJuego(puntuacionJuego)}`}>
                ⭐ {formatearPuntuacionJuego(puntuacionJuego)}
              </span>
              <p className="game-detail-description">
                {descripcionJuego}
              </p>

              <div className="game-engagement-stats" aria-live="polite">
                <div>
                  <strong>{estadisticas.visitas}</strong>
                  <span>Visitas</span>
                </div>
                <div>
                  <strong>{estadisticas.likes}</strong>
                  <span>Me gusta</span>
                </div>
                <div>
                  <strong>{estadisticas.dislikes}</strong>
                  <span>No me gusta</span>
                </div>
              </div>

              <div className="game-detail-actions">
                <GameVoteButtons
                  juego={{ ...juego, ...estadisticas }}
                  onStatsChange={actualizarEstadisticas}
                />
                <FavoriteButton juego={juego} />
              </div>
            </div>
          </article>
        ) : null}
        {juegoCargadoKey === gameKey && !juego && !error ? (
          <ZenkaiNotice title="JUEGO NO ENCONTRADO">
            Este juego no existe o ya no está disponible en Zenkai Games.
          </ZenkaiNotice>
        ) : null}
      </main>
    </div>
  );
}

export default GameDetailPage;
