import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/useAuth";
import catalogoJuegos, { buscarJuegoEnCatalogo } from "../data/gameCatalog";
import "./Home.css";

const estadoInicial = {
  nombre: "",
  genero: "",
  etiqueta: "",
  puntuacion: "",
  imagen: "",
  descripcion: "",
};

function Juegos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const [juegos, setJuegos] = useState([]);
  const [formulario, setFormulario] = useState(estadoInicial);
  const [editandoId, setEditandoId] = useState(null);
  const [formularioAbierto, setFormularioAbierto] = useState(() => Boolean(location.state?.abrirFormulario));
  const [juegoExpandidoId, setJuegoExpandidoId] = useState(null);
  const [generoActivo, setGeneroActivo] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const obtenerJuegos = async () => {
    const respuesta = await axios.get("http://localhost:3001/juegos");
    return respuesta.data?.juegos || [];
  };

  const cargarJuegos = async () => {
    try {
      setJuegos(await obtenerJuegos());
      setError("");
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la lista de juegos.");
    }
  };

  useEffect(() => {
    let ignore = false;

    obtenerJuegos()
      .then((juegosCargados) => {
        if (!ignore) setJuegos(juegosCargados);
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
  const juegosFiltrados = generoActivo === "Todos" ? juegos : juegos.filter((juego) => juego.genero === generoActivo);

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
            ? { genero: "", etiqueta: "", imagen: "", descripcion: "" }
            : {}),
        };
      }

      return {
        ...actual,
        nombre: value,
        genero: juegoEncontrado.genero,
        etiqueta: juegoEncontrado.etiqueta,
        imagen: juegoEncontrado.imagen,
        descripcion: juegoEncontrado.descripcion,
      };
    });
  };

  const resetFormulario = () => {
    setFormulario(estadoInicial);
    setEditandoId(null);
    setFormularioAbierto(false);
    setError("");
  };

  const guardarJuego = async (evento) => {
    evento.preventDefault();

    const nombre = formulario.nombre.trim();
    const genero = formulario.genero.trim();
    const etiqueta = formulario.etiqueta.trim();
    const puntuacion = Number(formulario.puntuacion);
    const descripcion = formulario.descripcion.trim();
    const imagen = formulario.imagen.trim();

    if (!nombre || !genero || !etiqueta || !formulario.puntuacion || !descripcion || !imagen) {
      setError("Completá todos los campos, incluida la imagen si el juego no está en el catálogo.");
      return;
    }

    if (!Number.isFinite(puntuacion) || puntuacion < 0 || puntuacion > 10) {
      setError("La puntuación debe ser un número entre 0 y 10.");
      return;
    }

    const payload = {
      nombre,
      genero,
      etiqueta,
      puntuacion,
      plataforma: "",
      imagen,
      descripcion,
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
      setError("No se pudo guardar el juego. Revisá los datos e intentá nuevamente.");
    } finally {
      setGuardando(false);
    }
  };

  const editarJuego = (juego) => {
    setEditandoId(juego.id);
    setFormulario({
      nombre: juego.nombre || "",
      genero: juego.genero || "",
      etiqueta: juego.etiqueta || "",
      puntuacion: juego.puntuacion ?? "",
      imagen: juego.imagen || "",
      descripcion: juego.descripcion || "",
    });
    setFormularioAbierto(true);
    setError("");
  };

  const eliminarJuego = async (id) => {
    const confirmar = window.confirm("¿Seguro que querés eliminar este juego?");
    if (!confirmar) return;

    try {
      await axios.delete(`http://localhost:3001/juegos/${id}`);
      await cargarJuegos();
      if (editandoId === id) {
        resetFormulario();
      }
      if (juegoExpandidoId === id) {
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
                  <h3 id="game-form-title">{editandoId ? "Editar juego" : "Agregar nuevo juego"}</h3>
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
                      list="known-games"
                      required
                    />
                    <datalist id="known-games">
                      {catalogoJuegos.map((juego) => (
                        <option key={juego.nombre} value={juego.nombre} />
                      ))}
                    </datalist>
                  </label>

                  <label>
                    <span>Género</span>
                    <input type="text" name="genero" value={formulario.genero} onChange={manejarCambio} placeholder="Ej: Arcade" required />
                  </label>

                  <label>
                    <span>Etiqueta</span>
                    <input type="text" name="etiqueta" value={formulario.etiqueta} onChange={manejarCambio} placeholder="Ej: Juego de arcade" required />
                  </label>

                  <label>
                    <span>Puntuación</span>
                    <input
                      type="number"
                      name="puntuacion"
                      min="0"
                      max="10"
                      step="0.1"
                      value={formulario.puntuacion}
                      onChange={manejarCambio}
                      placeholder="9.5"
                      required
                    />
                  </label>

                  <label className="full-width">
                    <span>Imagen (URL)</span>
                    <input
                      type="url"
                      name="imagen"
                      value={formulario.imagen}
                      onChange={manejarCambio}
                      placeholder="Se completa automáticamente para juegos del catálogo"
                      required
                    />
                    {formulario.nombre && !buscarJuegoEnCatalogo(formulario.nombre) ? (
                      <small className="catalog-hint">No está en el catálogo; podés pegar la URL de una imagen.</small>
                    ) : null}
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
                      required
                    />
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="primary-button" disabled={guardando}>
                    {guardando ? "Guardando..." : editandoId ? "Actualizar juego" : "Guardar juego"}
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
                        <span className="game-card-tag">{juego.etiqueta || "Juego"}</span>
                      </div>
                      <div className="game-card-info">
                        <div className="game-card-topline">
                          <span className="game-card-genre">{juego.genero || "Sin género"}</span>
                          <span className="game-card-score">{Number(juego.puntuacion || 0).toFixed(1)}</span>
                        </div>
                        <h3>{juego.nombre}</h3>
                        <p className="game-card-description">{juego.descripcion || "Sin descripción disponible."}</p>
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
                            <div><span>Etiqueta</span><strong>{juego.etiqueta || "Sin etiqueta"}</strong></div>
                            <div><span>Puntuación</span><strong>⭐ {Number(juego.puntuacion || 0).toFixed(1)} / 10</strong></div>
                            {juego.plataforma ? <div><span>Plataforma</span><strong>{juego.plataforma}</strong></div> : null}
                            <div className="expanded-description"><span>Descripción</span><p>{juego.descripcion || "Sin descripción disponible."}</p></div>
                            <div className="crud-actions">
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
                                  eliminarJuego(juego.id);
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
                  <div className="empty-games">No hay juegos cargados para este género.</div>
                )}
              </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Juegos;
