import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import api from "../api";
import "./Juegos.css";

const empty = {
  nombre: "", genero: "", etiqueta: "", plataforma: "",
  jugadores: "", imagen: "", descripcion: "", rawg_id: ""
};

export default function Juegos() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [juegos, setJuegos] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(false);
  const [myRatings, setMyRatings] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ratingBusy, setRatingBusy] = useState({});
  const admin = usuario?.role === "admin";

  async function load() {
    try {
      const { data } = await api.get("/games");
      setJuegos(data.juegos || []);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.mensaje || "No se pudieron cargar los juegos.");
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (query.trim().length < 2 || selected) {
      setResults([]);
      return undefined;
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get("/catalog/games", { params: { search: query.trim() } });
        setResults(data.resultados || []);
      } catch (requestError) {
        // La búsqueda externa es opcional. El administrador puede cargar el juego manualmente.
        setResults([]);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [query, selected]);

  useEffect(() => {
    if (!usuario || juegos.length === 0) {
      setMyRatings({});
      return undefined;
    }
    let active = true;
    Promise.all(juegos.map(async (game) => {
      try {
        const { data } = await api.get(`/games/${game.id}/my-rating`);
        return [game.id, data.puntuacion];
      } catch {
        return [game.id, null];
      }
    })).then((rows) => {
      if (active) setMyRatings(Object.fromEntries(rows));
    });
    return () => { active = false; };
  }, [juegos, usuario]);

  function reset() {
    setForm(empty);
    setQuery("");
    setResults([]);
    setSelected(false);
    setEditId(null);
    setOpen(false);
    setError("");
  }

  function choose(game) {
    setForm((current) => ({
      ...current,
      nombre: game.nombre,
      genero: game.genero || current.genero,
      imagen: game.imagen || current.imagen,
      rawg_id: game.id,
      plataforma: current.plataforma || game.plataforma || ""
    }));
    setQuery(game.nombre);
    setResults([]);
    setSelected(true);
  }

  function edit(game) {
    setEditId(game.id);
    setForm({
      nombre: game.nombre,
      genero: game.genero || "",
      etiqueta: game.etiqueta || "",
      plataforma: game.plataforma || "",
      jugadores: game.jugadores || "",
      imagen: game.imagen || "",
      descripcion: game.descripcion || "",
      rawg_id: game.rawg_id || ""
    });
    setQuery(game.nombre);
    setSelected(Boolean(game.rawg_id));
    setOpen(true);
    setError("");
  }

  async function save(event) {
    event.preventDefault();
    if (!form.nombre.trim()) {
      setError("Ingresá el nombre del juego.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (editId) await api.put(`/games/${editId}`, form);
      else await api.post("/games", form);
      await load();
      reset();
    } catch (requestError) {
      setError(requestError.response?.data?.mensaje || "No se pudo guardar el juego.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!window.confirm("¿Eliminar este juego?")) return;
    try {
      await api.delete(`/games/${id}`);
      setJuegos((current) => current.filter((game) => game.id !== id));
      setMyRatings((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
    } catch (requestError) {
      setError(requestError.response?.data?.mensaje || "No se pudo eliminar el juego.");
    }
  }

  async function rate(id, score) {
    if (!usuario) {
      setError("Iniciá sesión para valorar un juego.");
      return;
    }
    setRatingBusy((current) => ({ ...current, [id]: true }));
    setError("");
    try {
      const { data } = await api.post(`/games/${id}/ratings`, { puntuacion: score });
      setMyRatings((current) => ({ ...current, [id]: data.puntuacion }));
      setJuegos((current) => current.map((game) => game.id === id
        ? { ...game, promedio: data.promedio, cantidad_votos: data.cantidad_votos }
        : game));
    } catch (requestError) {
      setError(requestError.response?.data?.mensaje || "No se pudo guardar tu valoración.");
    } finally {
      setRatingBusy((current) => ({ ...current, [id]: false }));
    }
  }

  return (
    <div className="games-page">
      <header className="games-nav">
        <strong onClick={() => navigate("/home")}>🎮 Zenkai Games</strong>
        <nav>
          <button type="button" onClick={() => navigate("/home")}>Inicio</button>
          <button type="button" className="active">Juegos</button>
          <button type="button" onClick={logout}>Cerrar sesión</button>
        </nav>
      </header>

      <main className="games-content">
        <div className="games-title">
          <div>
            <p className="eyebrow">CATÁLOGO GAMER</p>
            <h1>Explorá los juegos</h1>
            <p>Descubrí títulos, consultá sus datos y dejá tu valoración.</p>
          </div>
          {admin && <button type="button" className="primary" onClick={() => { reset(); setOpen(true); }}>＋ Agregar juego</button>}
        </div>

        {error && <p className="games-error" role="alert">{error}</p>}

        {open && admin && (
          <div className="game-form-card">
            <div className="form-top">
              <h2>{editId ? "Editar juego" : "Agregar juego"}</h2>
              <button type="button" onClick={reset}>✕</button>
            </div>
            <form onSubmit={save}>
              <label className="wide">
                Nombre del juego
                <input
                  placeholder="Ej. Minecraft"
                  value={query}
                  onChange={(event) => {
                    const value = event.target.value;
                    setQuery(value);
                    setSelected(false);
                    setForm((current) => ({ ...current, nombre: value, rawg_id: "" }));
                  }}
                  required
                />
              </label>

              {!selected && results.length > 0 && (
                <div className="catalog-results">
                  <small>Resultados opcionales de RAWG. También podés cargar el juego manualmente.</small>
                  {results.map((game) => (
                    <button type="button" key={game.id} onClick={() => choose(game)}>
                      {game.imagen && <img src={game.imagen} alt="" />}
                      <span><b>{game.nombre}</b><small>{game.fecha || "Fecha no disponible"} · {game.genero || "Género no disponible"}</small></span>
                    </button>
                  ))}
                </div>
              )}

              <label>Género<input value={form.genero} onChange={(event) => setForm((v) => ({ ...v, genero: event.target.value }))} required /></label>
              <label>Etiqueta<input value={form.etiqueta} onChange={(event) => setForm((v) => ({ ...v, etiqueta: event.target.value }))} /></label>
              <label>Plataforma<input value={form.plataforma} onChange={(event) => setForm((v) => ({ ...v, plataforma: event.target.value }))} required /></label>
              <label>Jugadores<input value={form.jugadores} onChange={(event) => setForm((v) => ({ ...v, jugadores: event.target.value }))} required /></label>
              <label className="wide">Imagen (URL)<input type="url" value={form.imagen} onChange={(event) => setForm((v) => ({ ...v, imagen: event.target.value }))} /></label>
              <label className="wide">Descripción<textarea value={form.descripcion} onChange={(event) => setForm((v) => ({ ...v, descripcion: event.target.value }))} required /></label>

              <div className="form-actions">
                <button type="button" onClick={reset}>Cancelar</button>
                <button type="submit" className="primary" disabled={busy}>{busy ? "Guardando..." : editId ? "Guardar cambios" : "Agregar juego"}</button>
              </div>
            </form>
          </div>
        )}

        {juegos.length === 0
          ? <p className="empty-games">Todavía no hay juegos cargados.</p>
          : (
            <div className="games-grid">
              {juegos.map((game) => (
                <article className="game-card" key={game.id}>
                  {game.imagen && <img className="game-cover" src={game.imagen} alt={game.nombre} />}
                  <div className="game-info">
                    <div className="game-name">
                      <h2>{game.nombre}</h2>
                      {admin && <div className="admin-actions">
                        <button type="button" onClick={() => edit(game)}>Editar</button>
                        <button type="button" onClick={() => remove(game.id)}>Eliminar</button>
                      </div>}
                    </div>
                    <p className="game-meta">{game.genero} {game.etiqueta && `· ${game.etiqueta}`}</p>
                    <p><b>Plataforma:</b> {game.plataforma || "No especificada"}</p>
                    <p><b>Jugadores:</b> {game.jugadores || "No especificado"}</p>
                    <p className="description">{game.descripcion}</p>
                    <div className="rating-line">
                      <div className="stars-display" aria-label={`Promedio ${game.promedio} de 5`}>
                        {"★".repeat(Math.round(game.promedio || 0))}
                        <span>{"★".repeat(5 - Math.round(game.promedio || 0))}</span>
                      </div>
                      <b>{Number(game.promedio || 0).toFixed(2)}/5</b>
                      <small>({game.cantidad_votos || 0} votos)</small>
                    </div>
                    <div className="your-rating" aria-label="Tu valoración">
                      <span>Tu valoración:</span>
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          type="button"
                          key={score}
                          className={score <= (myRatings[game.id] || 0) ? "chosen" : ""}
                          onClick={() => rate(game.id, score)}
                          disabled={Boolean(ratingBusy[game.id])}
                          aria-label={`Valorar con ${score} estrellas`}
                          aria-pressed={myRatings[game.id] === score}
                        >★</button>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )
        }
        <p className="rawg-credit">Datos de catálogo externos opcionales: <a href="https://rawg.io" target="_blank" rel="noreferrer">RAWG</a>.</p>
      </main>
    </div>
  );
}
