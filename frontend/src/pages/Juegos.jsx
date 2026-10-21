import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/useAuth";
import catalogoJuegos, { buscarJuegoEnCatalogo } from "../data/gameCatalog";
import GameCard from "../components/GameCard";
import FavoriteButton from "../components/FavoriteButton";
import { coincideBusquedaJuego } from "../utils/gameKey";
import "./Home.css";

const estadoInicial = {
  nombre: "",
  genero: "",
  imagen: "",
  descripcion: "",
};

const TAMANO_MAXIMO_IMAGEN = 5 * 1024 * 1024;
const TIPOS_IMAGEN_PERMITIDOS = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"];

function Juegos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const [juegos, setJuegos] = useState([]);
  const [formulario, setFormulario] = useState(estadoInicial);
  const [editandoId, setEditandoId] = useState(null);
  const [catalogoEnEdicionKey, setCatalogoEnEdicionKey] = useState(null);
  const [formularioAbierto, setFormularioAbierto] = useState(() => Boolean(location.state?.abrirFormulario));
  const [juegoExpandidoId, setJuegoExpandidoId] = useState(null);
  const [generoActivo, setGeneroActivo] = useState("Todos");
  const [generoCatalogoActivo, setGeneroCatalogoActivo] = useState("Todos");
  const [busquedaJuegos, setBusquedaJuegos] = useState("");
  const [juegosCatalogoOcultos, setJuegosCatalogoOcultos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const obtenerJuegos = async () => {
    const respuesta = await axios.get("http://localhost:3001/juegos");
    return respuesta.data?.juegos || [];
  };

  const obtenerJuegosCatalogoOcultos = async () => {
    const respuesta = await axios.get("http://localhost:3001/catalogo-juegos/ocultos");
    return respuesta.data?.juegos || [];
  };

  const cargarJuegos = async () => {
    try {
      const [juegosCargados, ocultos] = await Promise.all([
        obtenerJuegos(),
        obtenerJuegosCatalogoOcultos(),
      ]);
      setJuegos(juegosCargados);
      setJuegosCatalogoOcultos(ocultos);
      setError("");
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la lista de juegos.");
    }
  };

  useEffect(() => {
    let ignore = false;

    Promise.all([obtenerJuegos(), obtenerJuegosCatalogoOcultos()])
      .then(([juegosCargados, ocultos]) => {
        if (!ignore) {
          setJuegos(juegosCargados);
          setJuegosCatalogoOcultos(ocultos);
        }
      })
      .catch((err) => {
        console.error(err);
        if (!ignore) setError("No se pudo cargar la lista de juegos.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (location.state?.abrirFormulario) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const generos = ["Todos", ...new Set(juegos.map((juego) => juego.genero).filter(Boolean))];
  const juegosFiltrados = juegos.filter((juego) => (
    (generoActivo === "Todos" || juego.genero === generoActivo)
      && coincideBusquedaJuego(juego, busquedaJuegos)
  ));
  const normalizarNombreJuego = (nombre) => nombre
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
  const juegosDelCatalogo = new Map(
    catalogoJuegos.map((juego) => {
      const catalogKey = normalizarNombreJuego(juego.nombre);
      return [`catalogo:${catalogKey}`, { ...juego, catalog_key: catalogKey }];
    })
  );

  juegos.forEach((juego) => {
    if (juego.nombre && juego.genero) {
      const catalogKey = juego.catalog_key || (buscarJuegoEnCatalogo(juego.nombre)
        ? normalizarNombreJuego(juego.nombre)
        : null);
      const clave = catalogKey
        ? `catalogo:${catalogKey}`
        : `personalizado:${normalizarNombreJuego(juego.nombre)}`;
      juegosDelCatalogo.set(clave, {
        ...juegosDelCatalogo.get(clave),
        ...juego,
        catalog_key: catalogKey,
      });
    }
  });

  const juegosCatalogoOcultosSet = new Set(juegosCatalogoOcultos);
  const todosLosJuegos = [...juegosDelCatalogo.values()].filter(
    (juego) => !juego.catalog_key || !juegosCatalogoOcultosSet.has(juego.catalog_key)
  );
  const generosCatalogo = [...new Set(todosLosJuegos.map((juego) => juego.genero).filter(Boolean))];
  const coloresGeneros = {
    Terror: "#ff4d4d",
    Shooter: "#ff8a3d",
    RPG: "#4cc9f0",
    Sandbox: "#7c4dff",
    Carreras: "#38b000",
    Acción: "#ff8a3d",
    "Hack and Slash": "#ff8a3d",
    "Lucha/Peleas": "#ff4d4d",
    MMORPG: "#4cc9f0",
    Metroidvania: "#7c4dff",
    Roguelike: "#7c4dff",
  };
  const barrasGenerosCatalogo = generosCatalogo.map((nombre) => {
    const total = todosLosJuegos.filter((juego) => juego.genero === nombre).length;

    return {
      nombre,
      total,
      porcentaje: Math.max(18, Math.round((total / todosLosJuegos.length) * 100)),
      color: coloresGeneros[nombre] || "#7c4dff",
    };
  });
  const juegosCatalogoFiltrados = todosLosJuegos.filter((juego) => (
    (generoCatalogoActivo === "Todos" || juego.genero === generoCatalogoActivo)
      && coincideBusquedaJuego(juego, busquedaJuegos)
  ));

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;
    setFormulario((actual) => {
      if (name !== "nombre") return { ...actual, [name]: value };

      const juegoEncontrado = buscarJuegoEnCatalogo(value);
      if (!juegoEncontrado) {
        const nombreActualEstaEnCatalogo = buscarJuegoEnCatalogo(actual.nombre);
        return {
          ...actual,
          nombre: value,
          ...(nombreActualEstaEnCatalogo
            ? { genero: "", imagen: "", descripcion: "" }
            : {}),
        };
      }

      return {
        ...actual,
        nombre: value,
        genero: juegoEncontrado.genero,
        imagen: juegoEncontrado.imagen,
        descripcion: juegoEncontrado.descripcion,
      };
    });
  };

  const manejarPegadoImagen = (evento) => {
    const datosPortapapeles = evento.clipboardData;
    const archivoDesdeItems = Array.from(datosPortapapeles?.items || [])
      .find((item) => item.kind === "file" && item.type.startsWith("image/"))
      ?.getAsFile();
    const archivo = archivoDesdeItems || Array.from(datosPortapapeles?.files || [])
      .find((archivoPortapapeles) => archivoPortapapeles.type.startsWith("image/"));

    if (!archivo) return;

    evento.preventDefault();
    setError("");

    if (!TIPOS_IMAGEN_PERMITIDOS.includes(archivo.type)) {
      setError("Ese formato de imagen no es compatible. Pegá una imagen PNG, JPG, WEBP, GIF o AVIF.");
      return;
    }

    if (archivo.size > TAMANO_MAXIMO_IMAGEN) {
      setError("La imagen pegada supera el límite de 5 MB.");
      return;
    }

    const lector = new FileReader();
    lector.onload = () => {
      if (typeof lector.result !== "string") {
        setError("No se pudo leer la imagen pegada.");
        return;
      }

      setFormulario((actual) => ({ ...actual, imagen: lector.result }));
    };
    lector.onerror = () => {
      console.error("No se pudo leer la imagen del portapapeles:", lector.error);
      setError("No se pudo leer la imagen pegada. Intentá copiarla nuevamente.");
    };
    lector.readAsDataURL(archivo);
  };

  const resetFormulario = () => {
    setFormulario(estadoInicial);
    setEditandoId(null);
    setCatalogoEnEdicionKey(null);
    setFormularioAbierto(false);
    setError("");
  };

  const guardarJuego = async (evento) => {
    evento.preventDefault();

    const nombre = formulario.nombre.trim();
    const genero = formulario.genero.trim();
    const descripcion = formulario.descripcion.trim();
    const imagen = formulario.imagen.trim();

    if (!nombre || !genero || !descripcion || !imagen) {
      setError("Completá el nombre, el género, la imagen y la descripción.");
      return;
    }

    const juegoExistente = juegos.find((juego) => juego.id === editandoId);
    const juegoCatalogoKey = catalogoEnEdicionKey
      || (buscarJuegoEnCatalogo(nombre) ? normalizarNombreJuego(nombre) : null);
    const payload = {
      nombre,
      genero,
      etiqueta: juegoExistente?.etiqueta || "",
      puntuacion: juegoExistente?.puntuacion ?? null,
      plataforma: juegoExistente?.plataforma || "",
      imagen,
      descripcion,
      catalogKey: juegoCatalogoKey,
    };

    try {
      setGuardando(true);
      setError("");

      if (editandoId) {
        await axios.put(`http://localhost:3001/juegos/${editandoId}`, payload);
      } else {
        await axios.post("http://localhost:3001/juegos", payload);
      }

      await cargarJuegos();
      resetFormulario();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.mensaje
          || "No se pudo guardar el juego. Revisá los datos e intentá nuevamente."
      );
    } finally {
      setGuardando(false);
    }
  };

  const editarJuego = (juego) => {
    setEditandoId(juego.id);
    setCatalogoEnEdicionKey(juego.catalog_key || null);
    setFormulario({
      nombre: juego.nombre || "",
      genero: juego.genero || "",
      imagen: juego.imagen || "",
      descripcion: juego.descripcion || "",
    });
    setFormularioAbierto(true);
    setError("");
  };

  const eliminarJuego = async (juego) => {
    const confirmar = window.confirm("¿Seguro que querés eliminar este juego?");
    if (!confirmar) return;

    try {
      const catalogKey = juego.catalog_key
        || (buscarJuegoEnCatalogo(juego.nombre) ? normalizarNombreJuego(juego.nombre) : null);
      if (juego.id) {
        await axios.delete(`http://localhost:3001/juegos/${juego.id}`, {
          data: { catalogKey },
        });
      } else if (catalogKey) {
        await axios.delete(`http://localhost:3001/catalogo-juegos/${encodeURIComponent(catalogKey)}`);
      } else {
        throw new Error("No se pudo identificar el juego para eliminarlo.");
      }
      await cargarJuegos();
      if (editandoId === juego.id) {
        resetFormulario();
      }
      if (juegoExpandidoId === juego.id) {
        setJuegoExpandidoId(null);
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar el juego.");
    }
  };

  const cerrarSesion = () => {
    logout();
    navigate("/");
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
          <button type="button" onClick={() => navigate("/noticias")}>Noticias</button>
          <button type="button" onClick={() => navigate("/comunidad")}>Comunidad</button>
          <button type="button" onClick={() => navigate("/acerca-de")}>Acerca de</button>
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

      <main className="crud-main">
        <section className="games-section crud-section">
          <div className="section-header">
            <div>
              <p className="section-label">ADMIN</p>
              <h2>🎮 Gestión de juegos</h2>
            </div>
            <button
              type="button"
              className="add-game-button"
              aria-label="Agregar nuevo juego"
              title="Agregar nuevo juego"
              onClick={() => {
                resetFormulario();
                setFormularioAbierto(true);
              }}
            >
              <span aria-hidden="true">+</span>
            </button>
          </div>

          <div className="game-search">
            <label htmlFor="games-page-search">Buscar en todos los juegos</label>
            <div className="game-search-control">
              <input
                id="games-page-search"
                type="search"
                value={busquedaJuegos}
                onChange={(evento) => setBusquedaJuegos(evento.target.value)}
                placeholder="Nombre, género o descripción..."
                autoComplete="off"
              />
              {busquedaJuegos ? (
                <button type="button" className="game-search-clear" onClick={() => setBusquedaJuegos("")}>
                  Limpiar
                </button>
              ) : null}
            </div>
          </div>

          {formularioAbierto ? (
            <div
              className="game-modal-backdrop"
              onMouseDown={(evento) => {
                if (evento.target === evento.currentTarget) resetFormulario();
              }}
            >
              <form
                className="game-form game-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="game-form-title"
                onSubmit={guardarJuego}
              >
                <div className="game-form-heading">
                  <h3 id="game-form-title">{editandoId || catalogoEnEdicionKey ? "Editar juego" : "Agregar nuevo juego"}</h3>
                  <button type="button" className="modal-close-button" aria-label="Cerrar formulario" onClick={resetFormulario}>
                    ×
                  </button>
                </div>

                {error ? <p className="form-error" role="alert">{error}</p> : null}

                <div className="form-grid">
                  <label className="full-width">
                    <span>Nombre</span>
                    <input
                      type="text"
                      name="nombre"
                      value={formulario.nombre}
                      onChange={manejarCambio}
                      placeholder="Ej: Minecraft"
                      maxLength={255}
                      required
                    />
                  </label>

                  <label>
                    <span>Género</span>
                    <input type="text" name="genero" value={formulario.genero} onChange={manejarCambio} placeholder="Ej: Arcade" maxLength={120} required />
                  </label>

                  <label className="full-width">
                    <span>Imagen</span>
                    <input
                      type="text"
                      name="imagen"
                      value={formulario.imagen}
                      onChange={manejarCambio}
                      onPaste={manejarPegadoImagen}
                      placeholder="Pegá una URL o copiá y pegá una imagen"
                      maxLength={7 * 1024 * 1024}
                      required
                    />
                    <small className="catalog-hint">
                      Pegá una URL o copiá una imagen y pegala aquí (PNG, JPG, WEBP, GIF o AVIF; máximo 5 MB).
                      Los juegos del catálogo completan la imagen automáticamente.
                    </small>
                  </label>

                  {formulario.imagen ? (
                    <div className="game-form-preview full-width">
                      <img src={formulario.imagen} alt={`Carátula de ${formulario.nombre || "juego"}`} />
                      <div>
                        <strong>{formulario.nombre || "Vista previa"}</strong>
                        <p>{formulario.descripcion || "La descripción aparecerá aquí."}</p>
                      </div>
                    </div>
                  ) : null}

                  <label className="full-width">
                    <span>Descripción</span>
                    <textarea
                      name="descripcion"
                      value={formulario.descripcion}
                      onChange={manejarCambio}
                      placeholder="La descripción se completa automáticamente para juegos del catálogo."
                      rows="4"
                      maxLength={10000}
                      required
                    />
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="primary-button" disabled={guardando}>
                    {guardando ? "Guardando..." : editandoId || catalogoEnEdicionKey ? "Actualizar juego" : "Guardar juego"}
                  </button>
                  <button type="button" className="secondary-button" onClick={resetFormulario}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          ) : null}

          <div className="crud-list-panel">
              <div className="genre-list crud-filters">
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

              <div className="crud-list crud-card-grid">
                {loading ? (
                  <div className="empty-games">Cargando juegos...</div>
                ) : juegosFiltrados.length > 0 ? (
                  juegosFiltrados.map((juego) => (
                    <article
                      className={`game-card crud-game-card ${juegoExpandidoId === juego.id ? "expanded" : ""}`}
                      key={juego.id}
                      role="group"
                      aria-expanded={juegoExpandidoId === juego.id}
                      onClick={() => setJuegoExpandidoId((actual) => actual === juego.id ? null : juego.id)}
                    >
                      <div className="game-card-image">
                        <img src={juego.imagen} alt={`Carátula de ${juego.nombre}`} />
                      </div>
                      <div className="game-card-info">
                        <div className="game-card-topline">
                          <span className="game-card-genre">{juego.genero || "Sin género"}</span>
                        </div>
                        <h3>{juego.nombre}</h3>
                        <p className="game-card-description">{juego.descripcion || "Sin descripción disponible."}</p>
                        <FavoriteButton juego={juego} />
                        <button
                          type="button"
                          className="expand-hint"
                          aria-expanded={juegoExpandidoId === juego.id}
                          onClick={(evento) => {
                            evento.stopPropagation();
                            setJuegoExpandidoId((actual) => actual === juego.id ? null : juego.id);
                          }}
                        >
                          {juegoExpandidoId === juego.id ? "Contraer información" : "Ver toda la información"}
                        </button>

                        {juegoExpandidoId === juego.id ? (
                          <div className="expanded-game-details">
                            <div><span>Género</span><strong>{juego.genero || "Sin género"}</strong></div>
                            {juego.plataforma ? <div><span>Plataforma</span><strong>{juego.plataforma}</strong></div> : null}
                            <div className="expanded-description"><span>Descripción</span><p>{juego.descripcion || "Sin descripción disponible."}</p></div>
                            <div className="crud-actions">
                              <button
                                type="button"
                                className="secondary-button"
                                onClick={(evento) => {
                                  evento.stopPropagation();
                                  navigate(`/juego/${encodeURIComponent(normalizarNombreJuego(juego.nombre))}`, {
                                    state: { juego },
                                  });
                                }}
                              >
                                Ver página del juego
                              </button>
                              <button
                                type="button"
                                className="secondary-button"
                                onClick={(evento) => {
                                  evento.stopPropagation();
                                  editarJuego(juego);
                                }}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                className="logout-button danger-button"
                                onClick={(evento) => {
                                  evento.stopPropagation();
                                  eliminarJuego(juego);
                                }}
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty-games">
                    {busquedaJuegos.trim()
                      ? "No se encontraron juegos guardados con esa búsqueda."
                      : "No hay juegos cargados para este género."}
                  </div>
                )}
              </div>
          </div>
        </section>

        <section className="games-section catalog-browse-section">
          <div className="section-header">
            <div>
              <p className="section-label">EXPLORÁ EL CATÁLOGO</p>
              <h2>🎮 Todos los juegos</h2>
            </div>
          </div>

          <div className="genre-bars">
            <button
              type="button"
              className={`genre-bar-item ${generoCatalogoActivo === "Todos" ? "active" : ""}`}
              aria-pressed={generoCatalogoActivo === "Todos"}
              onClick={() => setGeneroCatalogoActivo("Todos")}
            >
              <div className="genre-bar-header">
                <span>Todos</span>
                <strong>{todosLosJuegos.length}</strong>
              </div>
              <div className="genre-bar-track">
                <div className="genre-bar-fill" style={{ width: "100%", background: "#d10000" }} />
              </div>
            </button>
            {barrasGenerosCatalogo.map((genero) => (
              <button
                key={genero.nombre}
                type="button"
                className={`genre-bar-item ${generoCatalogoActivo === genero.nombre ? "active" : ""}`}
                aria-pressed={generoCatalogoActivo === genero.nombre}
                onClick={() => setGeneroCatalogoActivo(genero.nombre)}
              >
                <div className="genre-bar-header">
                  <span>{genero.nombre}</span>
                  <strong>{genero.total}</strong>
                </div>
                <div className="genre-bar-track">
                  <div
                    className="genre-bar-fill"
                    style={{ width: `${genero.porcentaje}%`, background: genero.color }}
                  />
                </div>
              </button>
            ))}
          </div>

          <p className="genre-filter-status" aria-live="polite">
            {busquedaJuegos.trim()
              ? `Se encontraron ${juegosCatalogoFiltrados.length} juegos${generoCatalogoActivo === "Todos" ? "" : ` de ${generoCatalogoActivo}`}`
              : generoCatalogoActivo === "Todos"
                ? `Mostrando todos los juegos (${juegosCatalogoFiltrados.length})`
                : `Mostrando ${juegosCatalogoFiltrados.length} juegos de ${generoCatalogoActivo}`}
          </p>

          <div className="games-grid">
            {juegosCatalogoFiltrados.length > 0 ? (
              juegosCatalogoFiltrados.map((juego) => (
                <GameCard
                  key={juego.catalog_key || juego.id || juego.nombre}
                  juego={juego}
                  onEdit={editarJuego}
                  onDelete={eliminarJuego}
                />
              ))
            ) : (
              <div className="empty-games">
                {busquedaJuegos.trim()
                  ? "No se encontraron juegos con esa búsqueda."
                  : "No hay juegos en este género todavía."}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Juegos;
