import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { normalizarClaveJuego } from "../utils/gameKey";
import ZenkaiNotice from "./ZenkaiNotice";
import { crearHeadersAutenticacion } from "../utils/authHeaders";

function GameVoteButtons({ juego, compact = false, onStatsChange }) {
  const { usuario } = useAuth();
  const gameKey = juego?.nombre ? normalizarClaveJuego(juego.nombre) : "";
  const [votos, setVotos] = useState({
    likes: Number(juego?.likes) || 0,
    dislikes: Number(juego?.dislikes) || 0,
    liked_by_user: Boolean(juego?.liked_by_user),
    disliked_by_user: Boolean(juego?.disliked_by_user),
  });
  const [cargaCompletadaKey, setCargaCompletadaKey] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const claveCarga = `${gameKey}:${usuario?.id || ""}:${usuario?.token || ""}`;
  const cargando = Boolean(gameKey && cargaCompletadaKey !== claveCarga);

  useEffect(() => {
    let ignore = false;

    if (!gameKey) {
      return undefined;
    }

    axios.get(`http://localhost:3001/engagement/juegos/${encodeURIComponent(gameKey)}`, {
      headers: crearHeadersAutenticacion(usuario?.token),
    })
      .then((respuesta) => {
        if (!respuesta.data?.success || !respuesta.data.juego) {
          throw new Error("No se pudo cargar el estado de los votos.");
        }

        const juegoActualizado = respuesta.data.juego;
        if (!ignore) {
          const siguientesVotos = {
            likes: Number(juegoActualizado.likes) || 0,
            dislikes: Number(juegoActualizado.dislikes) || 0,
            liked_by_user: Boolean(juegoActualizado.liked_by_user),
            disliked_by_user: Boolean(juegoActualizado.disliked_by_user),
          };
          setVotos(siguientesVotos);
          onStatsChange?.(juegoActualizado);
          setError("");
        }
      })
      .catch((loadError) => {
        console.error("No se pudo cargar el estado de los votos:", loadError);
        if (!ignore) setError("No se pudieron cargar los votos. Recargá la página para intentar nuevamente.");
      })
      .finally(() => {
        if (!ignore) setCargaCompletadaKey(claveCarga);
      });

    return () => {
      ignore = true;
    };
  }, [gameKey, usuario?.token, onStatsChange, claveCarga]);

  const cambiarVoto = async (tipo) => {
    if (!usuario?.token || !gameKey || cargando || guardando) return;

    const esLikeActivo = tipo === "like" && votos.liked_by_user;
    const esDislikeActivo = tipo === "dislike" && votos.disliked_by_user;
    const quitarVoto = esLikeActivo || esDislikeActivo;
    const endpoint = `http://localhost:3001/engagement/juegos/${encodeURIComponent(gameKey)}/${tipo}`;

    try {
      setGuardando(true);
      setError("");
      if (quitarVoto) {
        await axios.delete(endpoint, { headers: crearHeadersAutenticacion(usuario.token) });
      } else {
        await axios.post(endpoint, {
          juego: {
            nombre: juego.nombre,
            genero: juego.genero || "",
            imagen: juego.imagen?.startsWith("data:") ? "" : juego.imagen || "",
            descripcion: juego.descripcion || "",
          },
        }, { headers: crearHeadersAutenticacion(usuario.token) });
      }

      const respuesta = await axios.get(
        `http://localhost:3001/engagement/juegos/${encodeURIComponent(gameKey)}`,
        { headers: crearHeadersAutenticacion(usuario.token) }
      );
      if (!respuesta.data?.success || !respuesta.data.juego) {
        throw new Error("No se pudo actualizar el conteo de votos.");
      }

      const juegoActualizado = respuesta.data.juego;
      setVotos({
        likes: Number(juegoActualizado.likes) || 0,
        dislikes: Number(juegoActualizado.dislikes) || 0,
        liked_by_user: Boolean(juegoActualizado.liked_by_user),
        disliked_by_user: Boolean(juegoActualizado.disliked_by_user),
      });
      onStatsChange?.(juegoActualizado);
    } catch (voteError) {
      console.error("No se pudo actualizar el voto del juego:", voteError);
      setError(voteError.response?.data?.mensaje || "No se pudo actualizar el voto. Intentá nuevamente.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div
      className={`game-vote-controls ${compact ? "compact" : ""}`}
      aria-label={`Votos de ${juego?.nombre || "este juego"}`}
      onClick={(evento) => evento.stopPropagation()}
    >
      <button
        type="button"
        className={`game-page-like ${votos.liked_by_user ? "active" : ""}`}
        aria-pressed={votos.liked_by_user}
        disabled={!usuario?.token || cargando || guardando}
        onClick={() => cambiarVoto("like")}
        title={usuario?.token ? "Me gusta" : "Iniciá sesión para votar"}
      >
        {guardando ? "…" : "♥"} <span>Me gusta</span> ({votos.likes})
      </button>
      <button
        type="button"
        className={`game-page-dislike ${votos.disliked_by_user ? "active" : ""}`}
        aria-pressed={votos.disliked_by_user}
        disabled={!usuario?.token || cargando || guardando}
        onClick={() => cambiarVoto("dislike")}
        title={usuario?.token ? "No me gusta" : "Iniciá sesión para votar"}
      >
        {guardando ? "…" : "👎"} <span>No me gusta</span> ({votos.dislikes})
      </button>
      {error ? <ZenkaiNotice className="game-vote-error">{error}</ZenkaiNotice> : null}
    </div>
  );
}

export default GameVoteButtons;
