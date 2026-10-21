import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/useAuth";
import GameCard from "../components/GameCard";
import FavoriteButton from "../components/FavoriteButton";
import { useFavorites } from "../context/favoriteHooks";
import "./Home.css";

const juegos = [
  {
    nombre: "Minecraft",
    genero: "Sandbox",
    puntuacion: 9.8,
    etiqueta: "🔥 Más jugado",
    jugadores: "1-10",
    dificultad: "Fácil",
    descripcion: "Creatividad infinita, construcciones épicas y experiencias cooperativas sin fin.",
    imagen: "https://images2.alphacoders.com/137/thumb-1920-1370592.jpeg"
  },
  {
    nombre: "GTA V",
    genero: "Acción",
    puntuacion: 9.2,
    etiqueta: "⭐ Destacado",
    jugadores: "1-16",
    dificultad: "Media",
    descripcion: "Mundo abierto, misiones intensas, libertad completa y una jugabilidad enorme.",
    imagen: "https://cdn.wallpapersafari.com/92/89/S1KxLt.jpg"
  },
  {
    nombre: "Resident Evil 4",
    genero: "Terror",
    puntuacion: 9.4,
    etiqueta: "🏆 Top Zenkai",
    jugadores: "1",
    dificultad: "Alta",
    descripcion: "Tensión constante, supervivencia brutal y una atmósfera increíblemente inmersiva.",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPfy213xBg46vWZjw04FLLIJvzmuG8g7X5wAuPvXX3VJAMHU75"
  },
  {
    nombre: "Doom Eternal",
    genero: "Shooter",
    puntuacion: 8.9,
    etiqueta: "⚡ Clásico",
    jugadores: "1-4",
    dificultad: "Alta",
    descripcion: "Acción frenética, armas brutales y un ritmo que no te deja respirar.",
    imagen: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTLEzjM1fn9G1nsXTbaI4oKtuacL-1PT0xvKMG8TEcvIUtAj4qd"
  },
  {
    nombre: "The Witcher 3",
    genero: "RPG",
    puntuacion: 9.1,
    etiqueta: "🌍 Mundo abierto",
    jugadores: "1",
    dificultad: "Media",
    descripcion: "Historia profunda, decisiones importantes y un mundo lleno de detalle.",
    imagen: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQt7QwNsxC0h8M9-k3qWKzg31jLBjWgPyoUnNlSlPGilX0LmTTd"
  },
  {
    nombre: "Hollow Knight",
    genero: "Metroidvania",
    puntuacion: 9.0,
    etiqueta: "🕷️ Indie",
    jugadores: "1",
    dificultad: "Alta",
    descripcion: "Exploración magistral, arte precioso y un desafío más que satisfactorio.",
    imagen: "https://i.pinimg.com/736x/e4/6c/d9/e46cd932609864801ce2ae8312faf855.jpg"
  },
  {
    nombre: "Devil May Cry 5",
    genero: "Hack and Slash",
    puntuacion: 8.7,
    etiqueta: "⚙️ Combate técnico",
    jugadores: "1",
    dificultad: "Alta",
    descripcion: "Combos ultra vistosos, estilo impecable y una experiencia de acción sublime.",
    imagen: "https://cdn.mos.cms.futurecdn.net/xDhhYzmU9GvdH9pRFzpf9T.jpg"
  },
  {
    nombre: "Mortal Kombat 1",
    genero: "Lucha/Peleas",
    puntuacion: 8.3,
    etiqueta: "🥋 Peleas/sangriento",
    jugadores: "1-2",
    dificultad: "Media",
    descripcion: "Peleas intensas, combos explosivos y una presentación visual brutal.",
    imagen: "https://preview.redd.it/mortal-kombat-1-screenshots-i-honestly-like-it-v0-pirl215zotyd1.jpg?width=1080&crop=smart&auto=webp&s=81d13f4df19466e9715488417a535356f6399176"
  },
  {
    nombre: "World of Warcraft",
    genero: "MMORPG",
    puntuacion: 7.4,
    etiqueta: "Rol en línea",
    jugadores: "1-40",
    dificultad: "Media",
    descripcion: "Gran comunidad, raids épicos y una progresión de personajes muy profunda.",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7pALTskfSABdHirWcyFQWp8pW7BIRacoQMIFiBt39LmcghtfWXA2EG8Jk&s=10"
  },
  {
    nombre: "Hades",
    genero: "Roguelike",
    puntuacion: 8.8,
    etiqueta: "Adictivo/Acción rápida",
    jugadores: "1",
    dificultad: "Media",
    descripcion: "Partidas dinámicas, mejora de habilidades y una historia muy bien ejecutada.",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQs8c0h4-uK6k2EUYHHaQiWE9uuYfvX153YFOh5ufRiS5HBdbo-"
  },
  {
    nombre: "Forza Horizon 5",
    genero: "Carreras",
    puntuacion: 9.0,
    etiqueta: "Carreras de mundo abierto",
    jugadores: "1-12",
    dificultad: "Media",
    descripcion: "Exploración de mundo abierto, variedad de vehículos y eventos emocionantes.",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQL4hKrZ65FtYq3g4eUmzbfxPdkf-zfIhyNBw_X2ojLqm2-cOQo4OKfo3w&s=10"
  }
];

const contentByType = {
  rankings: [
    {
      title: "#1 Minecraft",
      tag: "Top global",
      description: "Puntuación máxima por comunidad, innovación y duración.",
      meta: "9.8/10",
      accent: "#fbbf24"
    },
    {
      title: "#2 Elden Ring",
      tag: "RPG",
      description: "Aventura épica con mundo enorme y exploración profunda.",
      meta: "9.7/10",
      accent: "#fca5a5"
    },
    {
      title: "#3 GTA V",
      tag: "Mundo abierto",
      description: "Una experiencia completa con libertad y variedad.",
      meta: "9.6/10",
      accent: "#93c5fd"
    }
  ],
  noticias: [
    {
      title: "Nuevos eventos del mes",
      tag: "Actualidad",
      description: "Descubrí los próximos torneos, lanzamientos y novedades.",
      meta: "Hoy",
      accent: "#22c55e"
    },
    {
      title: "Actualizaciones importantes",
      tag: "Patch notes",
      description: "Mejoras de rendimiento, contenido nuevo y correcciones.",
      meta: "Reciente",
      accent: "#60a5fa"
    },
    {
      title: "La comunidad crece",
      tag: "Comunidad",
      description: "Más jugadores, más contenido y más encuentros en la plataforma.",
      meta: "Trending",
      accent: "#c084fc"
    }
  ],
  comunidad: [
    {
      title: "Foros y grupos",
      tag: "Social",
      description: "Conversá, compartí consejos y encontrá compañeros de juego.",
      meta: "+1200",
      accent: "#f472b6"
    },
    {
      title: "Retos semanales",
      tag: "Eventos",
      description: "Participá en desafíos para ganar reconocimiento y premios.",
      meta: "7 desafíos",
      accent: "#fb7185"
    },
    {
      title: "Tips del mes",
      tag: "Guías",
      description: "Aprendé estrategias, builds y trucos para subir tu nivel.",
      meta: "Novedad",
      accent: "#38bdf8"
    }
  ],
  perfil: [
    {
      title: "Mi perfil",
      tag: "Cuenta",
      description: "Acá podés ver tu información, progreso y preferencias.",
      meta: "Activo",
      accent: "#fbbf24"
    }
  ],
  "acerca-de": [
    {
      title: "Sobre Zenkai Games",
      tag: "Proyecto",
      description: "Una plataforma creada para descubrir, jugar y compartir la pasión gamer.",
      meta: "2026",
      accent: "#34d399"
    }
  ]
};

function SectionPage({ type = "juegos", title, subtitle }) {
  const navigate = useNavigate();
  const { usuario, login, logout } = useAuth();
  const { favoritos, cargando: cargandoFavoritos, errorCarga: errorFavoritosCarga } = useFavorites();
  const [generoActivo, setGeneroActivo] = useState("Todos");
  const [juegosGuardados, setJuegosGuardados] = useState([]);
  const [errorJuegos, setErrorJuegos] = useState("");
  const [publicaciones, setPublicaciones] = useState([]);
  const [comentariosPorPublicacion, setComentariosPorPublicacion] = useState({});
  const [comentariosAbiertosId, setComentariosAbiertosId] = useState(null);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [cargandoComentariosId, setCargandoComentariosId] = useState(null);
  const [guardandoComentario, setGuardandoComentario] = useState(false);
  const [guardandoLikeComentarioId, setGuardandoLikeComentarioId] = useState(null);
  const [errorComentarios, setErrorComentarios] = useState("");
  const [formularioContenido, setFormularioContenido] = useState({
    title: "",
    tag: "",
    description: "",
  });
  const [publicacionEditandoId, setPublicacionEditandoId] = useState(null);
  const [formularioContenidoAbierto, setFormularioContenidoAbierto] = useState(false);
  const [guardandoContenido, setGuardandoContenido] = useState(false);
  const [errorContenido, setErrorContenido] = useState("");
  const [mensajePerfil, setMensajePerfil] = useState("");
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [formularioPerfil, setFormularioPerfil] = useState({
    username: usuario?.username || "",
    email: usuario?.email || "",
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    if (type !== "perfil" || !usuario?.id) return undefined;

    let ignore = false;

    axios.get(`http://localhost:3001/perfil/${usuario.id}`)
      .then((respuesta) => {
        if (!respuesta.data?.success || !respuesta.data.usuario) {
          throw new Error("La respuesta del servidor no contiene el perfil.");
        }

        if (!ignore) {
          setFormularioPerfil((actual) => ({
            ...actual,
            username: respuesta.data.usuario.username || "",
            email: respuesta.data.usuario.email || "",
          }));
        }
      })
      .catch((error) => {
        console.error("No se pudo cargar el perfil:", error);
        if (!ignore) setErrorContenido("No se pudieron cargar los datos de la cuenta.");
      });

    return () => {
      ignore = true;
    };
  }, [type, usuario?.id]);

  useEffect(() => {
    if (type !== "rankings") return undefined;

    let ignore = false;

    axios.get("http://localhost:3001/juegos")
      .then((respuesta) => {
        if (!respuesta.data?.success || !Array.isArray(respuesta.data.juegos)) {
          throw new Error("La respuesta del servidor no contiene una lista de juegos.");
        }

        if (!ignore) setJuegosGuardados(respuesta.data.juegos);
      })
      .catch((error) => {
        console.error("No se pudieron cargar los juegos para rankings:", error);
        if (!ignore) setErrorJuegos("No se pudieron cargar los juegos del catálogo.");
      });

    return () => {
      ignore = true;
    };
  }, [type]);

  useEffect(() => {
    if (type !== "noticias" && type !== "comunidad") return undefined;

    let ignore = false;
    const claveRespuesta = type === "noticias" ? "noticias" : "publicaciones";

    axios.get(`http://localhost:3001/${type}`)
      .then((respuesta) => {
        if (!respuesta.data?.success || !Array.isArray(respuesta.data[claveRespuesta])) {
          throw new Error("La respuesta del servidor no contiene una lista de publicaciones.");
        }

        if (!ignore) setPublicaciones(respuesta.data[claveRespuesta]);
      })
      .catch((error) => {
        console.error(`No se pudo cargar ${type}:`, error);
        if (!ignore) setErrorContenido(`No se pudo cargar el contenido de ${title}.`);
      });

    return () => {
      ignore = true;
    };
  }, [type, title]);

  const juegosFiltrados = generoActivo === "Todos"
    ? juegos
    : juegos.filter((juego) => juego.genero === generoActivo);

  const generos = ["Todos", ...new Set(juegos.map((juego) => juego.genero))];

  const normalizarNombre = (nombre) => nombre
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
  const juegosGuardadosPorNombre = new Map(
    juegosGuardados.map((juego) => [normalizarNombre(juego.nombre || ""), juego])
  );
  const rankingBase = contentByType.rankings.map((item, index) => {
    const nombreBase = item.title.replace(/^#\d+\s*/, "");
    const juegoGuardado = juegosGuardadosPorNombre.get(normalizarNombre(nombreBase));
    if (!juegoGuardado) return item;

    const puntuacion = juegoGuardado.puntuacion === null || juegoGuardado.puntuacion === undefined
      || juegoGuardado.puntuacion === ""
      ? null
      : Number(juegoGuardado.puntuacion);

    return {
      ...item,
      title: `#${index + 1} ${juegoGuardado.nombre}`,
      tag: juegoGuardado.genero || item.tag,
      description: juegoGuardado.descripcion || item.description,
      meta: puntuacion === null || !Number.isFinite(puntuacion)
        ? "Sin puntuación"
        : `${puntuacion.toFixed(1)}/10`,
      image: juegoGuardado.imagen,
    };
  });
  const juegosAgregadosAlRanking = juegosGuardados
    .filter((juego) => !contentByType.rankings.some((item) => {
      const nombreBase = item.title.replace(/^#\d+\s*/, "");
      return normalizarNombre(nombreBase) === normalizarNombre(juego.nombre || "");
    }))
    .map((juego, index) => {
      const puntuacion = juego.puntuacion === null || juego.puntuacion === undefined || juego.puntuacion === ""
        ? null
        : Number(juego.puntuacion);

      return {
        ...juego,
        title: `#${rankingBase.length + index + 1} ${juego.nombre}`,
        tag: juego.genero || "Catálogo",
        description: juego.descripcion || "Juego agregado al catálogo de Zenkai Games.",
        meta: puntuacion === null || !Number.isFinite(puntuacion)
          ? "Sin puntuación"
          : `${puntuacion.toFixed(1)}/10`,
        image: juego.imagen,
      };
    });
  const items = type === "rankings"
    ? [...rankingBase, ...juegosAgregadosAlRanking]
    : type === "juegos"
      ? juegos
      : type === "noticias" || type === "comunidad"
        ? [...publicaciones, ...(contentByType[type] || [])]
        : type === "perfil"
          ? []
          : contentByType[type] || contentByType.rankings;

  const resetFormularioContenido = () => {
    setFormularioContenido({ title: "", tag: "", description: "" });
    setPublicacionEditandoId(null);
    setFormularioContenidoAbierto(false);
    setErrorContenido("");
  };

  const cargarPublicaciones = async () => {
    const claveRespuesta = type === "noticias" ? "noticias" : "publicaciones";
    const respuesta = await axios.get(`http://localhost:3001/${type}`);

    if (!respuesta.data?.success || !Array.isArray(respuesta.data[claveRespuesta])) {
      throw new Error("La respuesta del servidor no contiene una lista de publicaciones.");
    }

    setPublicaciones(respuesta.data[claveRespuesta]);
  };

  const abrirComentarios = async (publicacionId) => {
    if (comentariosAbiertosId === publicacionId) {
      setComentariosAbiertosId(null);
      return;
    }

    setComentariosAbiertosId(publicacionId);
    setNuevoComentario("");
    setErrorComentarios("");
    setCargandoComentariosId(publicacionId);

    try {
      const respuesta = await axios.get(`http://localhost:3001/comunidad/${publicacionId}/comentarios`, {
        params: { usuarioId: usuario?.id },
      });
      if (!respuesta.data?.success || !Array.isArray(respuesta.data.comentarios)) {
        throw new Error("La respuesta del servidor no contiene una lista de comentarios.");
      }

      setComentariosPorPublicacion((actual) => ({
        ...actual,
        [publicacionId]: respuesta.data.comentarios,
      }));
    } catch (error) {
      console.error("No se pudieron cargar los comentarios:", error);
      setErrorComentarios("No se pudieron cargar los comentarios.");
    } finally {
      setCargandoComentariosId(null);
    }
  };

  const guardarPublicacion = async (evento) => {
    evento.preventDefault();

    const titleValue = formularioContenido.title.trim();
    const tag = formularioContenido.tag.trim();
    const description = formularioContenido.description.trim();

    if (!titleValue || !description) {
      setErrorContenido("Completá el título y la descripción.");
      return;
    }

    const payload = {
      title: titleValue,
      tag,
      description,
      meta: type === "noticias" ? "Reciente" : "Nuevo",
      accent: type === "noticias" ? "#60a5fa" : "#f472b6",
    };

    try {
      setGuardandoContenido(true);
      setErrorContenido("");

      if (publicacionEditandoId) {
        await axios.put(`http://localhost:3001/${type}/${publicacionEditandoId}`, payload);
      } else {
        await axios.post(`http://localhost:3001/${type}`, payload);
      }

      await cargarPublicaciones();
      resetFormularioContenido();
    } catch (error) {
      console.error(`No se pudo guardar en ${type}:`, error);
      setErrorContenido("No se pudo guardar. Revisá los datos e intentá nuevamente.");
    } finally {
      setGuardandoContenido(false);
    }
  };

  const editarPublicacion = (publicacion) => {
    setPublicacionEditandoId(publicacion.id);
    setFormularioContenido({
      title: publicacion.title || "",
      tag: publicacion.tag || "",
      description: publicacion.description || "",
    });
    setFormularioContenidoAbierto(true);
    setErrorContenido("");
  };

  const eliminarPublicacion = async (id) => {
    const confirmar = window.confirm("¿Seguro que querés eliminar esta publicación?");
    if (!confirmar) return;

    try {
      await axios.delete(`http://localhost:3001/${type}/${id}`);
      await cargarPublicaciones();
    } catch (error) {
      console.error(`No se pudo eliminar de ${type}:`, error);
      setErrorContenido("No se pudo eliminar la publicación.");
    }
  };

  const publicarComentario = async (evento, publicacionId) => {
    evento.preventDefault();
    const contenido = nuevoComentario.trim();

    if (!usuario?.id || !contenido) {
      setErrorComentarios("Escribí un comentario antes de publicarlo.");
      return;
    }

    try {
      setGuardandoComentario(true);
      setErrorComentarios("");
      await axios.post(`http://localhost:3001/comunidad/${publicacionId}/comentarios`, {
        usuarioId: usuario.id,
        contenido,
      });
      setNuevoComentario("");

      const respuesta = await axios.get(`http://localhost:3001/comunidad/${publicacionId}/comentarios`, {
        params: { usuarioId: usuario.id },
      });
      if (!respuesta.data?.success || !Array.isArray(respuesta.data.comentarios)) {
        throw new Error("La respuesta del servidor no contiene una lista de comentarios.");
      }

      setComentariosPorPublicacion((actual) => ({
        ...actual,
        [publicacionId]: respuesta.data.comentarios,
      }));
      setPublicaciones((actual) => actual.map((publicacion) => (
        publicacion.id === publicacionId
          ? { ...publicacion, comentarios_count: (publicacion.comentarios_count || 0) + 1 }
          : publicacion
      )));
    } catch (error) {
      console.error("No se pudo publicar el comentario:", error);
      setErrorComentarios("No se pudo publicar el comentario. Intentá nuevamente.");
    } finally {
      setGuardandoComentario(false);
    }
  };

  const cambiarLikeComentario = async (comentario) => {
    if (!usuario?.id || guardandoLikeComentarioId === comentario.id) return;

    try {
      setGuardandoLikeComentarioId(comentario.id);
      setErrorComentarios("");
      const endpoint = `http://localhost:3001/comunidad/comentarios/${comentario.id}/like`;

      if (comentario.liked_by_user) {
        await axios.delete(endpoint, { params: { usuarioId: usuario.id } });
      } else {
        await axios.post(endpoint, { usuarioId: usuario.id });
      }

      const respuesta = await axios.get(
        `http://localhost:3001/comunidad/${comentario.publicacion_id}/comentarios`,
        { params: { usuarioId: usuario.id } }
      );
      if (!respuesta.data?.success || !Array.isArray(respuesta.data.comentarios)) {
        throw new Error("La respuesta del servidor no contiene una lista de comentarios.");
      }

      setComentariosPorPublicacion((actual) => ({
        ...actual,
        [comentario.publicacion_id]: respuesta.data.comentarios,
      }));
    } catch (error) {
      console.error("No se pudo actualizar el like del comentario:", error);
      setErrorComentarios("No se pudo actualizar el like. Intentá nuevamente.");
    } finally {
      setGuardandoLikeComentarioId(null);
    }
  };

  const compartirComentario = (comentario) => {
    const texto = `${comentario.username} comentó: "${comentario.contenido}"\n\nMirá la conversación en ${window.location.origin}/comunidad`;
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const guardarPerfil = async (evento) => {
    evento.preventDefault();

    if (!usuario?.id || !formularioPerfil.currentPassword) {
      setErrorContenido("Ingresá tu contraseña actual para guardar los cambios.");
      return;
    }

    try {
      setGuardandoPerfil(true);
      setErrorContenido("");
      setMensajePerfil("");

      const respuesta = await axios.patch(`http://localhost:3001/perfil/${usuario.id}`, {
        username: formularioPerfil.username.trim(),
        email: formularioPerfil.email.trim(),
        currentPassword: formularioPerfil.currentPassword,
        newPassword: formularioPerfil.newPassword,
      });

      if (!respuesta.data?.success || !respuesta.data.usuario) {
        throw new Error("La respuesta del servidor no contiene el perfil actualizado.");
      }

      login(respuesta.data.usuario);
      setFormularioPerfil((actual) => ({ ...actual, currentPassword: "", newPassword: "" }));
      setMensajePerfil("Tu perfil se actualizó correctamente.");
    } catch (error) {
      console.error("No se pudo actualizar el perfil:", error);
      setErrorContenido(error.response?.data?.mensaje || "No se pudo actualizar el perfil.");
    } finally {
      setGuardandoPerfil(false);
    }
  };


  const cerrarSesion = () => {
    logout();
    navigate("/");
  };

  if (type === "juegos") {
    return (
      <div className="home">
        <header className="navbar">
          <div className="navbar-logo">
            <span className="logo-icon">🎮</span>
            <span>Zenkai Games</span>
          </div>

          <nav className="navbar-menu">
            <button onClick={() => navigate("/home")}>Inicio</button>
            <button onClick={() => navigate("/juegos")}>Juegos</button>
            <button onClick={() => navigate("/rankings")}>Rankings</button>
            <button onClick={() => navigate("/favoritos")}>Favoritos</button>
            <button onClick={() => navigate("/noticias")}>Noticias</button>
            <button onClick={() => navigate("/comunidad")}>Comunidad</button>
            <button onClick={() => navigate("/acerca-de")}>Acerca de</button>
          </nav>

          <div className="navbar-user">
            <button className="profile-button" onClick={() => navigate("/perfil")}>
              👤 Mi Perfil
            </button>
            <button className="logout-button" onClick={cerrarSesion}>
              🚪 Salir
            </button>
          </div>
        </header>

        <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px 60px" }}>
          <section className="hero" style={{ minHeight: "460px" }}>
            <div className="hero-content">
              <p className="hero-tag">🎮 ZENKAI GAMES</p>
              <h1>
                El catálogo gamer,<span> en un solo lugar.</span>
              </h1>
              <p className="hero-description">
                Explorá los mejores títulos, descubrí nuevos favoritos y viví la experiencia gamer con la misma vibra explosiva que en tu inicio.
              </p>
              <div className="hero-buttons">
                <button className="primary-button" onClick={() => navigate("/juegos")}>
                  Explorar juegos
                </button>
                <button className="secondary-button" onClick={() => navigate("/rankings")}>
                  Ver rankings
                </button>
              </div>
            </div>

            <div className="hero-decoration">
              <img
                src="https://images2.alphacoders.com/137/thumb-1920-1370592.jpeg"
                alt="Minecraft"
                className="hero-cover"
              />
            </div>
          </section>

          <section className="games-section">
            <div className="section-header">
              <div>
                <p className="section-label">CATÁLOGO</p>
                <h2>🎮 Juegos</h2>
              </div>
              <button className="outline-button" onClick={() => navigate("/juegos")}>
                Ver todos →
              </button>
            </div>

            <div className="genre-list" style={{ marginBottom: "18px" }}>
              {generos.map((genero) => (
                <button
                  key={genero}
                  type="button"
                  className={`genre-button ${generoActivo === genero ? "active" : ""}`}
                  aria-pressed={generoActivo === genero}
                  onClick={() => setGeneroActivo(genero)}
                >
                  {genero}
                </button>
              ))}
            </div>

            <p className="genre-filter-status" aria-live="polite">
              {generoActivo === "Todos"
                ? `Mostrando todos los juegos (${juegosFiltrados.length})`
                : `Mostrando ${juegosFiltrados.length} juegos de ${generoActivo}`}
            </p>

            <div className="games-grid">
              {juegosFiltrados.length > 0 ? (
                juegosFiltrados.map((juego) => (
                  <GameCard key={juego.nombre} juego={juego} />
                ))
              ) : (
                <div className="empty-games">No hay juegos de este género todavía.</div>
              )}
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="home">
      <header className="navbar">
        <div className="navbar-logo">
          <span className="logo-icon">🎮</span>
          <span>Zenkai Games</span>
        </div>

        <nav className="navbar-menu">
          <button onClick={() => navigate("/home")}>Inicio</button>
          <button onClick={() => navigate("/juegos")}>Juegos</button>
          <button onClick={() => navigate("/rankings")}>Rankings</button>
          <button onClick={() => navigate("/favoritos")}>Favoritos</button>
          <button onClick={() => navigate("/noticias")}>Noticias</button>
          <button onClick={() => navigate("/comunidad")}>Comunidad</button>
          <button onClick={() => navigate("/acerca-de")}>Acerca de</button>
        </nav>

        <div className="navbar-user">
          <button className="profile-button" onClick={() => navigate("/perfil")}>
            👤 Mi Perfil
          </button>
          <button className="logout-button" onClick={cerrarSesion}>
            🚪 Salir
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 20px 60px" }}>
        <section className="section-header" style={{ marginBottom: "20px" }}>
          <div>
            <p className="section-label">ZENKAI</p>
            <h2>{title}</h2>
            {subtitle ? <p className="genre-filter-status">{subtitle}</p> : null}
          </div>
          {type === "noticias" || type === "comunidad" ? (
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setFormularioContenido({ title: "", tag: "", description: "" });
                setPublicacionEditandoId(null);
                setFormularioContenidoAbierto(true);
                setErrorContenido("");
              }}
            >
              {type === "noticias" ? "Agregar noticia" : "Crear publicación"}
            </button>
          ) : null}
        </section>

        {type === "rankings" && errorJuegos ? (
          <p className="games-load-error" role="status">{errorJuegos}</p>
        ) : null}
        {(type === "noticias" || type === "comunidad" || type === "perfil") && errorContenido ? (
          <p className="games-load-error" role="alert">{errorContenido}</p>
        ) : null}
        {type === "perfil" ? (
          <section className="game-form section-content-form">
            <p className="section-label">TU CUENTA</p>
            <h3>Datos de perfil</h3>
            <p className="genre-filter-status">ID de usuario: {usuario?.id}</p>
            {mensajePerfil ? <p className="catalog-hint" role="status">{mensajePerfil}</p> : null}
            <form onSubmit={guardarPerfil}>
              <div className="form-grid">
                <label className="full-width">
                  <span>Nombre de usuario</span>
                  <input
                    type="text"
                    value={formularioPerfil.username}
                    onChange={(evento) => setFormularioPerfil((actual) => ({ ...actual, username: evento.target.value }))}
                    required
                  />
                </label>
                <label className="full-width">
                  <span>Correo electrónico</span>
                  <input
                    type="email"
                    value={formularioPerfil.email}
                    onChange={(evento) => setFormularioPerfil((actual) => ({ ...actual, email: evento.target.value }))}
                    required
                  />
                </label>
                <label className="full-width">
                  <span>Contraseña actual (para confirmar)</span>
                  <input
                    type="password"
                    value={formularioPerfil.currentPassword}
                    onChange={(evento) => setFormularioPerfil((actual) => ({ ...actual, currentPassword: evento.target.value }))}
                    autoComplete="current-password"
                    required
                  />
                </label>
                <label className="full-width">
                  <span>Nueva contraseña (opcional)</span>
                  <input
                    type="password"
                    value={formularioPerfil.newPassword}
                    onChange={(evento) => setFormularioPerfil((actual) => ({ ...actual, newPassword: evento.target.value }))}
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    placeholder="Dejala vacía si no querés cambiarla"
                  />
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="primary-button" disabled={guardandoPerfil}>
                  {guardandoPerfil ? "Guardando..." : "Guardar perfil"}
                </button>
              </div>
            </form>
          </section>
        ) : null}

        {formularioContenidoAbierto && (type === "noticias" || type === "comunidad") ? (
          <form className="game-form section-content-form" onSubmit={guardarPublicacion}>
            <h3>{publicacionEditandoId ? "Editar contenido" : type === "noticias" ? "Nueva noticia" : "Nueva publicación"}</h3>
            <div className="form-grid">
              <label className="full-width">
                <span>Título</span>
                <input
                  type="text"
                  value={formularioContenido.title}
                  onChange={(evento) => setFormularioContenido((actual) => ({ ...actual, title: evento.target.value }))}
                  required
                />
              </label>
              <label className="full-width">
                <span>{type === "noticias" ? "Categoría" : "Tema"}</span>
                <input
                  type="text"
                  value={formularioContenido.tag}
                  onChange={(evento) => setFormularioContenido((actual) => ({ ...actual, tag: evento.target.value }))}
                  placeholder={type === "noticias" ? "Ej: Lanzamientos" : "Ej: General"}
                />
              </label>
              <label className="full-width">
                <span>Descripción</span>
                <textarea
                  rows="4"
                  value={formularioContenido.description}
                  onChange={(evento) => setFormularioContenido((actual) => ({ ...actual, description: evento.target.value }))}
                  required
                />
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="primary-button" disabled={guardandoContenido}>
                {guardandoContenido ? "Guardando..." : publicacionEditandoId ? "Actualizar" : "Publicar"}
              </button>
              <button type="button" className="secondary-button" onClick={resetFormularioContenido}>
                Cancelar
              </button>
            </div>
          </form>
        ) : null}

        <div className="games-grid">
          {type === "favoritos" ? (
            cargandoFavoritos ? (
              <div className="empty-games">Cargando tus favoritos...</div>
            ) : errorFavoritosCarga ? (
              <div className="empty-games" role="alert">{errorFavoritosCarga}</div>
            ) : favoritos.length > 0 ? (
              favoritos.map((juego) => <GameCard key={juego.juego_key} juego={juego} />)
            ) : (
              <div className="empty-games">
                Todavía no guardaste juegos. Usá la estrella en Inicio, Juegos o Rankings para agregarlos.
              </div>
            )
          ) : items.map((item, index) => (
            <article className="game-card" key={`${item.title || item.nombre || item.tag}-${index}`}>
              {item.image ? (
                <div className="game-card-image">
                  <img src={item.image} alt={`Carátula de ${item.title || item.nombre}`} />
                </div>
              ) : null}
              <div className="game-card-info">
                <div className="game-card-topline">
                  <span className="game-card-genre">{item.tag || item.genero || "SECCIÓN"}</span>
                  <span className="game-card-score">{item.meta || item.puntuacion || "9.5"}</span>
                </div>
                <h3>{item.title || item.nombre}</h3>
                <p className="game-card-description">{item.description || item.descripcion}</p>
                {type === "comunidad" && item.id ? (
                  <section className="community-comments" aria-label={`Comentarios de ${item.title}`}>
                    <button
                      type="button"
                      className="secondary-button community-comments-toggle"
                      aria-expanded={comentariosAbiertosId === item.id}
                      onClick={() => abrirComentarios(item.id)}
                    >
                      {comentariosAbiertosId === item.id ? "Ocultar comentarios" : `Comentarios (${item.comentarios_count || 0})`}
                    </button>

                    {comentariosAbiertosId === item.id ? (
                      <div className="community-comments-panel">
                        {errorComentarios ? <p className="form-error" role="alert">{errorComentarios}</p> : null}

                        <form className="community-comment-form" onSubmit={(evento) => publicarComentario(evento, item.id)}>
                          <label className="full-width">
                            <span>Escribí un comentario</span>
                            <textarea
                              rows="3"
                              maxLength={1000}
                              value={nuevoComentario}
                              onChange={(evento) => setNuevoComentario(evento.target.value)}
                              placeholder="¿Qué opinás?"
                              required
                            />
                          </label>
                          <button type="submit" className="primary-button" disabled={guardandoComentario}>
                            {guardandoComentario ? "Publicando..." : "Comentar"}
                          </button>
                        </form>

                        {cargandoComentariosId === item.id ? (
                          <p className="community-comments-empty">Cargando comentarios...</p>
                        ) : (comentariosPorPublicacion[item.id] || []).length > 0 ? (
                          <ul className="community-comment-list">
                            {comentariosPorPublicacion[item.id].map((comentario) => (
                              <li className="community-comment" key={comentario.id}>
                                <div className="community-comment-heading">
                                  <strong>{comentario.username}</strong>
                                  <time dateTime={comentario.created_at}>
                                    {new Date(`${comentario.created_at}Z`).toLocaleString()}
                                  </time>
                                </div>
                                <p>{comentario.contenido}</p>
                                <div className="community-comment-actions">
                                  <button
                                    type="button"
                                    className={`community-comment-action ${comentario.liked_by_user ? "active" : ""}`}
                                    aria-pressed={Boolean(comentario.liked_by_user)}
                                    disabled={guardandoLikeComentarioId === comentario.id}
                                    onClick={() => cambiarLikeComentario(comentario)}
                                  >
                                    {comentario.liked_by_user ? "♥" : "♡"} Me gusta ({comentario.likes_count})
                                  </button>
                                  <button
                                    type="button"
                                    className="community-comment-action"
                                    onClick={() => compartirComentario(comentario)}
                                  >
                                    Compartir por WhatsApp
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="community-comments-empty">Todavía no hay comentarios. ¡Sé la primera persona en comentar!</p>
                        )}
                      </div>
                    ) : null}
                  </section>
                ) : null}
                {type === "rankings" ? (
                  <FavoriteButton
                    overlay={Boolean(item.image || item.imagen)}
                    juego={{
                      nombre: (item.title || item.nombre || "").replace(/^#\d+\s*/, ""),
                      genero: item.tag || item.genero || "",
                      imagen: item.image || item.imagen || "",
                      descripcion: item.description || item.descripcion || "",
                    }}
                  />
                ) : null}
                {(type === "noticias" || type === "comunidad") && item.id ? (
                  <div className="crud-actions">
                    <button type="button" className="secondary-button" onClick={() => editarPublicacion(item)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className="logout-button danger-button"
                      onClick={() => eliminarPublicacion(item.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

export default SectionPage;
