import { useState } from "react";
import GameCard from "../components/GameCard";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router";
import minecraftImage from "../assets/hero.png";
import "./Home.css";

function Home() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [generoActivo, setGeneroActivo] = useState("Todos");


  const juegosDestacados = [
    {
      nombre: "Minecraft",
      genero: "Sandbox",
      puntuacion: 9.5,
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
      nombre: "The Witcher 3: Wild Hunt",
      genero: "RPG",
      puntuacion: 9.1,
      etiqueta: "Mundo abierto",
      jugadores: "1",
      dificultad: "Media",
      descripcion: "Historia profunda, decisiones importantes y un mundo enorme lleno de detalle.",
      imagen: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQt7QwNsxC0h8M9-k3qWKzg31jLBjWgPyoUnNlSlPGilX0LmTTd"
    },
    {
      nombre: "World of Warcraft",
      genero: "MMORPG",
      puntuacion: 7.4,
      etiqueta: "Rol en linea",
      jugadores: "1-40",
      dificultad: "Media",
      descripcion: "Gran comunidad, raids épicos y una progresión de personajes muy profunda.",
      imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7pALTskfSABdHirWcyFQWp8pW7BIRacoQMIFiBt39LmcghtfWXA2EG8Jk&s=10"
    },
    {
      nombre: "Hollow Knight",
      genero: "Metroidvania",
      puntuacion: 9.0,
      etiqueta: "Indie/Desafiante",
      jugadores: "1",
      dificultad: "Alta",
      descripcion: "Exploración magistral, un arte precioso y un desafío más que satisfactorio.",
      imagen: "https://i.pinimg.com/736x/e4/6c/d9/e46cd932609864801ce2ae8312faf855.jpg"
    },
    {
      nombre: "Hades",
      genero: "Roguelike",
      puntuacion: 8.8,
      etiqueta: "Adictivo/Accion rapida",
      jugadores: "1",
      dificultad: "Media",
      descripcion: "Runas constantes, mejora de habilidades y una historia muy bien ejecutada.",
      imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQs8c0h4-uK6k2EUYHHaQiWE9uuYfvX153YFOh5ufRiS5HBdbo-"
    }
  ];

  const juegosShooter = [
    {
      nombre: "Doom",
      genero: "Shooter",
      puntuacion: 8.5,
      etiqueta: "Violencia sin filtro",
      jugadores: "1-4",
      dificultad: "Facil",
      descripcion: "Acción intensa, armas devastadoras y un ritmo que no te deja respirar.",
      imagen: "https://i.blogs.es/fc7ae1/doom-1/450_1000.webp"
    },
    {
      nombre: "Call of Duty: Modern Warfare",
      genero: "Shooter",
      puntuacion: 8.7,
      etiqueta: "Guerra moderna",
      jugadores: "1-12",
      dificultad: "Media",
      descripcion: "Campaña cinematográfica, multijugador competitivo y acción sin pausa.",
      imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4PLmaGZ0Em7n9rFMRV78AWcioQTfWIdUwjfjStXnTrXyvw3k2vwetD5l3&s=10"
    },
  ]

  const juegosTerror = [
    {
      nombre: "Silent Hill 2",
      genero: "Terror",
      puntuacion: 9.3,
      etiqueta: "Horror psicologico",
      jugadores: "1",
      dificultad: "Alta",
      descripcion: "Atmósfera inquietante, narrativa profunda y un terror que se queda contigo.",
      imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6xsyiSHQPtRwEOmuq0xi3AxRKIvvklqCjpslCUB4N8Y83ITj7hVEA_go&s=10"
    },
    {
      nombre: "Outlast",
      genero: "Terror",
      puntuacion: 8.6,
      etiqueta: "Horror de supervivencia",
      jugadores: "1",
      dificultad: "Alta",
      descripcion: "Tensión constante, persecuciones aterradoras y un ambiente que te mantiene al borde del asiento.",
      imagen: "https://store-images.s-microsoft.com/image/apps.52001.67759939744253232.91d27dff-a27e-44ea-9d15-3d3fc6acfd00.841c08cf-c100-4be3-abee-b444a2304b90"
    },
    {
      nombre: "Resident Evil 7",
      genero: "Terror",
      puntuacion: 8.9,
      etiqueta: "Horror en primera persona",
      jugadores: "1",
      dificultad: "Alta",
      descripcion: "Inmersión total, tensión constante y un regreso a las raíces del terror.",
      imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaOo4xSmuY74eXCv5aw6qJohrwN1yeGVky4O8RaxE1PUysfVVdphgF_ra_&s=10"
    }
  ]

  const juegosRPG = [
    {
      nombre: "Persona 5",
      genero: "RPG",
      puntuacion: 9.5,
      etiqueta: "RPG japonés",
      jugadores: "1",
      dificultad: "Media",
      descripcion: "Historia envolvente, personajes memorables y un sistema de combate estratégico.",
      imagen: "https://m.media-amazon.com/images/M/MV5BNWRmYzE4NzAtY2Q5My00Mjc1LWJhNDgtMmRmNGQzMzMyYTJkXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg"
    },
    {
      nombre: "Baldu´s Gate 3",
      genero: "RPG",
      puntuacion: 9.2,
      etiqueta: "RPG occidental",
      jugadores: "1-4",
      dificultad: "Alta",
      descripcion: "Exploración profunda, decisiones significativas y un mundo lleno de aventuras.",
      imagen: "https://store-images.s-microsoft.com/image/apps.11593.13550459053619040.9c555c73-a698-4992-b0f3-c5084cf18b5e.82a9ea41-c628-4d02-8a0f-d0304eba31c7"
    },
    {
      nombre: "Darkest Dungeon",
      genero: "RPG",
      puntuacion: 8.8,
      etiqueta: "RPG táctico",
      jugadores: "1",
      dificultad: "Alta",
      descripcion: "Gestión de recursos, combate estratégico y un desafío constante en un mundo oscuro.",
      imagen: "https://i.ytimg.com/vi/MBo4rwZERM8/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLC3MfenD3cSjkm5LyjPYhGtd6Y2Tg"
    }
  ]

  const juegosCarreras = [
    {
      nombre: "Forza Horizon 5",
      genero: "Carreras",
      puntuacion: 9,
      etiqueta: "Carreras de mundo abierto",
      jugadores: "1-12",
      dificultad: "Media",
      descripcion: "Exploracion de mundo abierto, variedad de vehiculos y eventos emocionantes",
      imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQL4hKrZ65FtYq3g4eUmzbfxPdkf-zfIhyNBw_X2ojLqm2-cOQo4OKfo3w&s=10"
    },
    {
      nombre: "Gran Turismo 7",
      genero: "Carreras",
      puntuacion: 8.7,
      etiqueta: "Simulador de carreras",
      jugadores: "1-20",
      dificultad: "Alta",
      descripcion: "Simulación realista, amplia selección de autos y circuitos, y una experiencia de conducción auténtica.",
      imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUcvOyyAlvqigMnoErl9Nz42Hm6SfiFwUykJ2jMw0k42am48w1cGIeuDo&s=10"
    },
    {
      nombre: "Mario Kart 8 Deluxe",
      genero: "Carreras",
      puntuacion: 8.5,
      etiqueta: "Carreras arcade",
      jugadores: "1-12",
      dificultad: "Media",
      descripcion: "Diversión para todos, personajes icónicos y circuitos llenos de acción y sorpresas.",
      imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5ktG_YR7ldiyaWxzsQK1DHU9ljqq2tGHVU_jko9KkQz-MQM2a3LSVMl1O&s=10"
    }
  ];

  const todosLosJuegos = [
    ...juegosDestacados,
    ...juegosShooter,
    ...juegosTerror,
    ...juegosRPG,
    ...juegosCarreras,
  ].filter((juego) => Boolean(juego?.nombre) && Boolean(juego?.genero));

  const generos = ["Todos", ...new Set(todosLosJuegos.map((juego) => juego.genero))];

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

  const barrasGeneros = generos.slice(1).map((nombre) => {
    const total = todosLosJuegos.filter((juego) => juego.genero === nombre).length;
    const porcentaje = Math.max(18, Math.round((total / todosLosJuegos.length) * 100 || 25));

    return {
      nombre,
      color: coloresGeneros[nombre] || "#7c4dff",
      total,
      porcentaje,
    };
  });

  const juegosFiltrados =
    generoActivo === "Todos"
      ? todosLosJuegos
      : todosLosJuegos.filter((juego) => juego.genero === generoActivo);

  const topsPorGenero = [
    {
      nombre: "Shooter",
      titulo: "Top de juegos de Shooter",
      color: "#ff8a3d",
      juegos: juegosShooter.slice(0, 3),
    },
    {
      nombre: "Terror",
      titulo: "Top de juegos de Terror",
      color: "#ff4d4d",
      juegos: juegosTerror.slice(0, 3),
    },
    {
      nombre: "RPG",
      titulo: "Top de juegos de RPG",
      color: "#4cc9f0",
      juegos: juegosRPG.slice(0, 3),
    },
    {
      nombre: "Sandbox",
      titulo: "Top de juegos de Sandbox",
      color: "#7c4dff",
      juegos: juegosDestacados.filter((juego) => juego.genero === "Sandbox").slice(0, 3),
    },
  ];

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
          <button onClick={() => navigate("/home")}>Inicio</button>
          <button onClick={() => navigate("/juegos")}>Juegos</button>
          <button onClick={() => navigate("/rankings")}>Rankings</button>
          <button onClick={() => navigate("/noticias")}>Noticias</button>
          <button onClick={() => navigate("/comunidad")}>Comunidad</button>
          <button onClick={() => navigate("/acerca")}>Acerca de</button>
        </nav>

        <div className="navbar-user">
          <button className="profile-button" onClick={() => navigate("/home")}>
            👤 Mi Perfil
          </button>

          <button className="logout-button" onClick={cerrarSesion}>
            🚪 Salir
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="hero-tag">🎮 ZENKAI GAMES</p>

            <h1>
              El mundo gamer,
              <span> en un solo lugar.</span>
            </h1>

            <p className="hero-description">
              Descubrí videojuegos, explorá rankings, enterate de las últimas
              noticias y compartí tu pasión con la comunidad.
            </p>

            <div className="hero-buttons">
              <button
                className="primary-button"
                onClick={() => navigate("/juegos")}
              >
                Explorar juegos
              </button>

              <button
                className="secondary-button"
                onClick={() => navigate("/rankings")}
              >
                Ver rankings
              </button>
            </div>
          </div>

          <div className="hero-decoration">
            <img
              src={minecraftImage}
              alt="Minecraft"
              className="hero-cover"
            />
          </div>
        </section>

        <section className="welcome-section">
          <p className="section-label">BIENVENIDO</p>

          <h2>
            {usuario?.username
              ? `Hola, ${usuario.username} 👋`
              : "Bienvenido a Zenkai Games"}
          </h2>

          <p>Tu aventura comienza acá.</p>
        </section>

        <section className="games-section">
          <div className="section-header">
            <div>
              <p className="section-label">DESTACADOS</p>
              <h2>🎮 Juegos destacados</h2>
            </div>

            <button className="outline-button" onClick={() => navigate("/juegos")}>
              Ver todos →
            </button>
          </div>

          <div className="genre-bars">
            <button
              type="button"
              className={`genre-bar-item ${generoActivo === "Todos" ? "active" : ""}`}
              aria-pressed={generoActivo === "Todos"}
              onClick={() => setGeneroActivo("Todos")}
            >
              <div className="genre-bar-header">
                <span>Todos</span>
                <strong>{todosLosJuegos.length}</strong>
              </div>
              <div className="genre-bar-track">
                <div
                  className="genre-bar-fill"
                  style={{ width: "100%", background: "#d10000" }}
                />
              </div>
            </button>
            {barrasGeneros.map((genero) => (
              <button
                key={genero.nombre}
                type="button"
                className={`genre-bar-item ${generoActivo === genero.nombre ? "active" : ""}`}
                aria-pressed={generoActivo === genero.nombre}
                onClick={() => setGeneroActivo(genero.nombre)}
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

          <div className="games-grid">
            {juegosFiltrados.length > 0 ? (
              juegosFiltrados.map((juego) => (
                <GameCard key={juego.nombre} juego={juego} />
              ))
            ) : (
              <div className="empty-games">Sin juegos aún</div>
            )}
          </div>
          <p className="genre-filter-status" aria-live="polite">
            {generoActivo === "Todos"
              ? `Mostrando todos los juegos (${juegosFiltrados.length})`
              : `Mostrando ${juegosFiltrados.length} juegos de ${generoActivo}`}
          </p>
        </section>

        <section className="ranking-section">
          <div className="section-header">
            <div>
              <p className="section-label">TOP ZENKAI</p>
              <h2>🏆 Rankings</h2>
            </div>

            <button className="outline-button" onClick={() => navigate("/rankings")}>
              Ver ranking →
            </button>
          </div>

          <div className="ranking-list">
            <div className="ranking-item first">
              <strong>#1</strong>
              <span>Minecraft</span>
              <b>9.8</b>
            </div>

            <div className="ranking-item">
              <strong>#2</strong>
              <span>Resident Evil 4</span>
              <b>9.4</b>
            </div>

            <div className="ranking-item">
              <strong>#3</strong>
              <span>GTA V</span>
              <b>9.2</b>
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="section-header">
            <div>
              <p className="section-label">ACTUALIDAD</p>
              <h2>📰 Últimas noticias</h2>
            </div>

            <button className="outline-button" onClick={() => navigate("/noticias")}>
              Ver noticias →
            </button>
          </div>

          <div className="news-grid">
            <article className="news-card">
              <span>Actualidad</span>
              <h3>Zenkai Games ya está en desarrollo</h3>
              <p>
                Conocé las novedades, mejoras y nuevas funcionalidades que
                llegaran al proyecto.
              </p>
            </article>

            <article className="news-card">
              <span>Videojuegos</span>
              <h3>Los videojuegos más destacados del año</h3>
              <p>
                Explorá nuestro catálogo y descubrí títulos populares de
                diferentes géneros.
              </p>
            </article>
          </div>
        </section>

        <section className="community-section">
          <div>
            <p className="section-label">COMUNIDAD</p>

            <h2>Compartí tu pasión por los videojuegos.</h2>

            <p>
              Próximamente vas a poder interactuar con otros usuarios,
              compartir opiniones y participar en la comunidad Zenkai.
            </p>
          </div>

          <button className="primary-button" onClick={() => navigate("/comunidad")}>
            Entrar a la comunidad
          </button>
        </section>
      </main>

      <footer className="footer">
        <div>
          <strong>🎮 Zenkai Games</strong>
          <p>Tu portal al mundo gamer.</p>
        </div>

        <div>
          <p>© 2026 Zenkai Games</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;