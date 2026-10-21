import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import FavoriteButton from "../components/FavoriteButton";
import catalogoJuegos from "../data/gameCatalog";
import { useAuth } from "../context/useAuth";
import { normalizarClaveJuego } from "../utils/gameKey";
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
  const [estadisticas, setEstadisticas] = useState({ visitas: 0, likes: 0 });
  const [likeActivo, setLikeActivo] = useState(false);
  const [guardandoLike, setGuardandoLike] = useState(false);
  const [juegoCargadoKey, setJuegoCargadoKey] = useState(null);
  const [error, setError] = useState("");
  const solicitudVisita = useRef({ gameKey: null, promise: null });

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
            datosJuego = datosGuardados.nombre
              ? datosGuardados
              : {
                nombre: gameKey,
                genero: "",
                imagen: "",
                descripcion: "Todavía no hay información adicional para este juego.",
              };
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
          });
          setLikeActivo(Boolean(datosJuego.liked_by_user));
        }
      })
      .catch((visitaError) => {
        console.error("No se pudieron cargar las estadísticas del juego:", visitaError);
        if (!ignore) {
          setJuegoCargadoKey(gameKey);
          setError("No se pudieron cargar los datos del juego.");
        }
      });

    return () => {
      ignore = true;
    };
  }, [gameKey, juegoInicial, usuario?.id]);

  const actualizarEstadisticas = async () => {
    const respuesta = await axios.get(
      `http://localhost:3001/engagement/juegos/${encodeURIComponent(gameKey)}`,
      { params: { usuarioId: usuario?.id } }
    );
    if (!respuesta.data?.success || !respuesta.data.juego) {
      throw new Error("La respuesta del servidor no contiene las estadísticas.");
    }

    setEstadisticas({
      visitas: Number(respuesta.data.juego.visitas) || 0,
      likes: Number(respuesta.data.juego.likes) || 0,
    });
    setLikeActivo(Boolean(respuesta.data.juego.liked_by_user));
  };

  const cambiarLike = async () => {
    if (!usuario?.id || guardandoLike) return;

    try {
      setGuardandoLike(true);
      setError("");
      const endpoint = `http://localhost:3001/engagement/juegos/${encodeURIComponent(gameKey)}/like`;

      if (likeActivo) {
        await axios.delete(endpoint, { params: { usuarioId: usuario.id } });
      } else {
        await axios.post(endpoint, { usuarioId: usuario.id });
      }

      await actualizarEstadisticas();
    } catch (likeError) {
      console.error("No se pudo actualizar el me gusta del juego:", likeError);
      setError("No se pudo actualizar el me gusta. Intentá nuevamente.");
    } finally {
      setGuardandoLike(false);
    }
  };

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
        </nav>

        <div className="navbar-user">
          <button type="button" className="logout-button" onClick={cerrarSesion}>
            🚪 Salir
          </button>
        </div>
      </header>

      <main className="game-detail-main">
        <button type="button" className="outline-button" onClick={() => navigate(-1)}>
          ← Volver
        </button>

        {error ? <p className="games-load-error" role="alert">{error}</p> : null}
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
              <p className="game-detail-description">
                {juego.descripcion || "Todavía no hay una descripción para este juego."}
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
                  <strong>{estadisticas.visitas + estadisticas.likes}</strong>
                  <span>Interés total</span>
                </div>
              </div>

              <div className="game-detail-actions">
                <button
                  type="button"
                  className={`game-page-like ${likeActivo ? "active" : ""}`}
                  aria-pressed={likeActivo}
                  disabled={!usuario?.id || guardandoLike}
                  onClick={cambiarLike}
                >
                  {guardandoLike ? "Guardando..." : likeActivo ? "♥ Te gusta" : "♡ Me gusta"} ({estadisticas.likes})
                </button>
                <FavoriteButton juego={juego} />
              </div>
            </div>
          </article>
        ) : (
          <div className="empty-games">No se encontró el juego solicitado.</div>
        )}
      </main>
    </div>
  );
}

export default GameDetailPage;
