import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/useAuth";
import GameCard from "../components/GameCard";
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
  const { logout } = useAuth();
  const [generoActivo, setGeneroActivo] = useState("Todos");
  const items = type === "juegos" ? juegos : contentByType[type] || contentByType.rankings;

  const juegosFiltrados = generoActivo === "Todos"
    ? juegos
    : juegos.filter((juego) => juego.genero === generoActivo);

  const generos = ["Todos", ...new Set(juegos.map((juego) => juego.genero))];

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
          </div>
        </section>

        <div className="games-grid">
          {items.map((item, index) => (
            <article className="game-card" key={`${item.title || item.nombre || item.tag}-${index}`}>
              <div className="game-card-info">
                <div className="game-card-topline">
                  <span className="game-card-genre">{item.tag || item.genero || "SECCIÓN"}</span>
                  <span className="game-card-score">{item.meta || item.puntuacion || "9.5"}</span>
                </div>
                <h3>{item.title || item.nombre}</h3>
                <p className="game-card-description">{item.description || item.descripcion}</p>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

export default SectionPage;
