import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { FavoritesContext } from "./favoriteHooks";
import { useAuth } from "./useAuth";

function getGameKey(name) {
  return name
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
}

function FavoritesProvider({ children }) {
  const { usuario } = useAuth();
  const [favoritosPorUsuario, setFavoritosPorUsuario] = useState({ usuarioId: null, items: [] });
  const [usuarioCargadoId, setUsuarioCargadoId] = useState(null);
  const [errorCarga, setErrorCarga] = useState("");

  useEffect(() => {
    if (!usuario?.id) return undefined;

    let ignore = false;

    axios.get(`http://localhost:3001/usuarios/${usuario.id}/favoritos`)
      .then((respuesta) => {
        if (!respuesta.data?.success || !Array.isArray(respuesta.data.favoritos)) {
          throw new Error("La respuesta del servidor no contiene una lista de favoritos.");
        }

        if (!ignore) {
          setFavoritosPorUsuario({
            usuarioId: usuario.id,
            items: respuesta.data.favoritos,
          });
          setErrorCarga("");
          setUsuarioCargadoId(usuario.id);
        }
      })
      .catch((error) => {
        console.error("No se pudieron cargar los favoritos:", error);
        if (!ignore) {
          setErrorCarga("No se pudieron cargar tus juegos favoritos.");
          setUsuarioCargadoId(usuario.id);
        }
      });

    return () => {
      ignore = true;
    };
  }, [usuario?.id]);

  const favoritos = useMemo(
    () => favoritosPorUsuario.usuarioId === usuario?.id ? favoritosPorUsuario.items : [],
    [favoritosPorUsuario, usuario?.id]
  );
  const cargando = Boolean(usuario?.id && usuarioCargadoId !== usuario.id);
  const clavesFavoritos = useMemo(
    () => new Set(favoritos.map((juego) => juego.juego_key)),
    [favoritos]
  );

  const toggleFavorito = async (juego) => {
    if (!usuario?.id) throw new Error("Iniciá sesión para guardar favoritos.");
    if (!juego?.nombre?.trim()) throw new Error("El juego no tiene un nombre válido.");

    const juegoKey = getGameKey(juego.nombre);
    const esFavorito = clavesFavoritos.has(juegoKey);

    if (esFavorito) {
      const respuesta = await axios.delete(
        `http://localhost:3001/usuarios/${usuario.id}/favoritos/${encodeURIComponent(juegoKey)}`
      );

      if (!respuesta.data?.success) throw new Error("No se pudo quitar el juego de favoritos.");

      setFavoritosPorUsuario((actual) => ({
        usuarioId: usuario.id,
        items: actual.usuarioId === usuario.id
          ? actual.items.filter((favorito) => favorito.juego_key !== juegoKey)
          : [],
      }));
      return;
    }

    const respuesta = await axios.post(
      `http://localhost:3001/usuarios/${usuario.id}/favoritos`,
      {
        juego: {
          nombre: juego.nombre.trim(),
          genero: juego.genero || "",
          imagen: juego.imagen || "",
          descripcion: juego.descripcion || "",
        },
      }
    );

    if (!respuesta.data?.success) throw new Error("No se pudo agregar el juego a favoritos.");

    const nuevoFavorito = {
      juego_key: juegoKey,
      nombre: juego.nombre.trim(),
      genero: juego.genero || "",
      imagen: juego.imagen || "",
      descripcion: juego.descripcion || "",
    };
    setFavoritosPorUsuario((actual) => ({
      usuarioId: usuario.id,
      items: actual.usuarioId === usuario.id
        ? [nuevoFavorito, ...actual.items.filter((favorito) => favorito.juego_key !== juegoKey)]
        : [nuevoFavorito],
    }));
  };

  return (
    <FavoritesContext.Provider value={{ favoritos, cargando, errorCarga, clavesFavoritos, toggleFavorito }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export default FavoritesProvider;
