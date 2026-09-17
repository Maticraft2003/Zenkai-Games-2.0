import { useState } from "react";
import GameCard from "../components/GameCard";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router";
import ParticlesBackground from "../components/ParticlesBackground";
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
      imagen: "https://images2.alphacoders.com/137/thumb-1920-1370592.jpeg"
    },
    {
      nombre: "GTA V",
      genero: "Acción",
      puntuacion: 9.2,
      etiqueta: "⭐ Destacado",
      imagen: "https://cdn.wallpapersafari.com/92/89/S1KxLt.jpg"
    },
    {
      nombre: "Resident Evil 4",
      genero: "Terror",
      puntuacion: 9.4,
      etiqueta: "🏆 Top Zenkai",
      imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPfy213xBg46vWZjw04FLLIJvzmuG8g7X5wAuPvXX3VJAMHU75"
    },
    {
      nombre: "Doom Eternal",
      genero: "Shooter",
      puntuacion: 8,
      etiqueta: "⚡ Clásico",
      imagen: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTLEzjM1fn9G1nsXTbaI4oKtuacL-1PT0xvKMG8TEcvIUtAj4qd"
    },
    {
      nombre: "Devil May Cry 5",
      genero: "Hack and Slash",
      puntuacion: 8.1,
      etiqueta: "⚙️ Combate técnico",
      imagen: "https://cdn.mos.cms.futurecdn.net/xDhhYzmU9GvdH9pRFzpf9T.jpg"
    },
    {
      nombre: "Mortal Kombat 1",
      genero: "Lucha/Peleas",
      puntuacion: 7,
      etiqueta: "🥋 Peleas/sangriento",
      imagen: "https://preview.redd.it/mortal-kombat-1-screenshots-i-honestly-like-it-v0-pirl215zotyd1.jpg?width=1080&crop=smart&auto=webp&s=81d13f4df19466e9715488417a535356f6399176"
    },
    {
      nombre: "The Witcher 3: Wild Hunt",
      genero: "RPG",
      puntuacion: 9.1,
      etiqueta: "Mundo abierto",
      imagen: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQt7QwNsxC0h8M9-k3qWKzg31jLBjWgPyoUnNlSlPGilX0LmTTd"
    },
    {
      nombre: "World of Warcraft",
      genero: "MMORPG",
      puntuacion: 5.5,
      etiqueta: "Rol en linea",
      imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7pALTskfSABdHirWcyFQWp8pW7BIRacoQMIFiBt39LmcghtfWXA2EG8Jk&s=10"
    },
    {
      nombre: "Hollow Knight",
      genero: "Metroidvania",
      puntuacion: 9,
      etiqueta: "Indie/Desafiante",
      imagen: "https://i.pinimg.com/736x/e4/6c/d9/e46cd932609864801ce2ae8312faf855.jpg"
    },
    {
      nombre: "Hades",
      genero: "Roguelike",
      puntuacion: 8.5,
      etiqueta: "Adictivo/Accion rapida",
      imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQs8c0h4-uK6k2EUYHHaQiWE9uuYfvX153YFOh5ufRiS5HBdbo-"
    }
  ];

  const generos = ["Todos", ...new Set(juegosDestacados.map((juego) => juego.genero))];

  const juegosFiltrados =
    generoActivo === "Todos"
      ? juegosDestacados
      : juegosDestacados.filter((juego) => juego.genero === generoActivo);

  const cerrarSesion = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="home">
      <ParticlesBackground />

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

      <div className="genre-list">
        {juegosDestacados.length > 0 ? (
          generos.map((genero) => (
            <button
              key={genero}
              type="button"
              className={`genre-button ${generoActivo === genero ? "active" : ""}`}
              onClick={() => setGeneroActivo(genero)}
            >
              {genero}
            </button>
          ))
        ) : (
          <span className="genre-empty">Sin juegos aún</span>
        )}
      </div>

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

          <div className="games-grid">
            {juegosFiltrados.length > 0 ? (
              juegosFiltrados.map((juego) => (
                <GameCard key={juego.nombre} juego={juego} />
              ))
            ) : (
              <div className="empty-games">Sin juegos aún</div>
            )}
          </div>
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