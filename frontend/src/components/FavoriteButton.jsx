import { useState } from "react";
import { useFavorites } from "../context/favoriteHooks";
import ZenkaiNotice from "./ZenkaiNotice";
import { normalizarClaveJuego } from "../utils/gameKey";

function FavoriteButton({ juego, overlay = false }) {
  const { clavesFavoritos, toggleFavorito } = useFavorites();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const clave = juego?.nombre ? normalizarClaveJuego(juego.nombre) : "";
  const esFavorito = clave ? clavesFavoritos.has(clave) : false;

  const manejarClick = async (evento) => {
    evento.stopPropagation();
    if (guardando) return;

    try {
      setGuardando(true);
      setError("");
      await toggleFavorito(juego);
    } catch (toggleError) {
      console.error("No se pudo actualizar el juego favorito:", toggleError);
      setError(toggleError.response?.data?.mensaje || toggleError.message || "No se pudo actualizar favoritos.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className={`favorite-control ${overlay ? "overlay" : ""}`}>
      <button
        type="button"
        className={`favorite-button ${esFavorito ? "active" : ""}`}
        aria-label={esFavorito ? `Quitar ${juego.nombre} de favoritos` : `Agregar ${juego.nombre} a favoritos`}
        aria-pressed={esFavorito}
        title={esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
        disabled={guardando}
        onClick={manejarClick}
      >
        {guardando ? "…" : esFavorito ? "★" : "☆"}
      </button>
      {error ? <ZenkaiNotice className="favorite-error">{error}</ZenkaiNotice> : null}
    </div>
  );
}

export default FavoriteButton;
