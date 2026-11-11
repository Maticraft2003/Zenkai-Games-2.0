import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { crearHeadersAutenticacion } from "../utils/authHeaders";
import { formatearPuntuacionJuego } from "../utils/gameRating";
import { normalizarClaveJuego } from "../utils/gameKey";
import ZenkaiNotice from "./ZenkaiNotice";

const estadoVacio = {
  cantidad_calificaciones: 0,
  puntuacion_comunidad: null,
  puntuacion_usuario: 0,
};

function GameRatingStars({ juego, compact = false }) {
  const { usuario } = useAuth();
  const juegoKey = juego?.nombre ? normalizarClaveJuego(juego.nombre) : "";
  const [calificacion, setCalificacion] = useState(estadoVacio);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    if (!juegoKey) return undefined;

    setCargando(true);
    axios.get(`http://localhost:3001/calificaciones/juegos/${encodeURIComponent(juegoKey)}`, {
      headers: crearHeadersAutenticacion(usuario?.token),
    })
      .then((response) => {
        if (!response.data?.success || !response.data.calificacion) {
          throw new Error("No se pudo cargar la puntuación.");
        }
        if (!ignore) {
          setCalificacion(response.data.calificacion);
          setError("");
        }
      })
      .catch((loadError) => {
        console.error("No se pudo cargar la puntuación:", loadError);
        if (!ignore) setError("No se pudo cargar la puntuación.");
      })
      .finally(() => {
        if (!ignore) setCargando(false);
      });

    return () => {
      ignore = true;
    };
  }, [juegoKey, usuario?.token]);

  const puntuar = async (puntuacion) => {
    if (!usuario?.token || !juegoKey || guardando || cargando) return;

    try {
      setGuardando(true);
      setError("");
      const response = await axios.post(
        `http://localhost:3001/calificaciones/juegos/${encodeURIComponent(juegoKey)}`,
        { puntuacion },
        { headers: crearHeadersAutenticacion(usuario.token) }
      );
      setCalificacion(response.data.calificacion);
    } catch (ratingError) {
      setError(ratingError.response?.data?.mensaje || "No se pudo guardar tu puntuación.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div
      className={`game-rating ${compact ? "compact" : ""}`}
      aria-label={`Puntuación de ${juego?.nombre || "este juego"}`}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="game-rating-stars" role="group" aria-label="Puntuar de 1 a 5 estrellas">
        {[1, 2, 3, 4, 5].map((estrella) => (
          <button
            key={estrella}
            type="button"
            className={estrella <= calificacion.puntuacion_usuario ? "active" : ""}
            aria-label={`${estrella} de 5 estrellas`}
            aria-pressed={calificacion.puntuacion_usuario === estrella}
            disabled={!usuario?.token || cargando || guardando}
            title={usuario?.token ? `Puntuar con ${estrella} estrellas` : "Iniciá sesión para puntuar"}
            onClick={() => puntuar(estrella)}
          >
            {estrella <= calificacion.puntuacion_usuario ? "★" : "☆"}
          </button>
        ))}
      </div>
      <span className="game-rating-summary">
        {cargando
          ? "Cargando puntuación..."
          : calificacion.puntuacion_comunidad === null
            ? "Sin calificaciones"
            : `${formatearPuntuacionJuego(calificacion.puntuacion_comunidad)} · ${calificacion.cantidad_calificaciones} ${calificacion.cantidad_calificaciones === 1 ? "voto" : "votos"}`}
      </span>
      {!usuario?.token ? <span className="game-rating-login-hint">Iniciá sesión para puntuar</span> : null}
      {error ? <ZenkaiNotice className="game-rating-error">{error}</ZenkaiNotice> : null}
    </div>
  );
}

export default GameRatingStars;