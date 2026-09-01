import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import ParticlesBackground from "../components/ParticlesBackground";
import "./Home.css";

function Home() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const cerrarSesion = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="home">
      <ParticlesBackground />

      {/* ================= NAVBAR ================= */}
      <header className="navbar">

        <div className="navbar-logo">
          <span className="logo-icon">🎮</span>
          <span>Zenkai Games</span>
        </div>

        <nav className="navbar-menu">
          <button onClick={() => navigate("/home")}>
            Inicio
          </button>

          <button onClick={() => navigate("/juegos")}>
            Juegos
          </button>

          <button onClick={() => navigate("/rankings")}>
            Rankings
          </button>

          <button onClick={() => navigate("/noticias")}>
            Noticias
          </button>

          <button onClick={() => navigate("/comunidad")}>
            Comunidad
          </button>

          <button onClick={() => navigate("/acerca")}>
            Acerca de
          </button>
        </nav>

        <div className="navbar-user">

          <button
            className="profile-button"
            onClick={() => navigate("/perfil")}
          >
            👤 Mi Perfil
          </button>

          <button
            className="logout-button"
            onClick={cerrarSesion}
          >
            🚪 Salir
          </button>

        </div>

      </header>


      {/* ================= HERO ================= */}
      <main>

        <section className="hero">

          <div className="hero-content">

            <p className="hero-tag">
              🎮 ZENKAI GAMES
            </p>

            <h1>
              El mundo gamer,
              <span> en un solo lugar.</span>
            </h1>

            <p className="hero-description">
              Descubrí videojuegos, explorá rankings,
              enterate de las últimas noticias y compartí
              tu pasión con la comunidad.
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
            <div className="hero-circle">
              🎮
            </div>
          </div>

        </section>


        {/* ================= BIENVENIDA ================= */}
        <section className="welcome-section">

          <p className="section-label">
            BIENVENIDO
          </p>

          <h2>
            {usuario?.username
              ? `Hola, ${usuario.username} 👋`
              : "Bienvenido a Zenkai Games"}
          </h2>

          <p>
            Tu aventura comienza acá.
          </p>

        </section>


        {/* ================= JUEGOS ================= */}
        <section className="content-section">

          <div className="section-header">

            <div>
              <p className="section-label">
                DESTACADOS
              </p>

              <h2>
                🔥 Juegos destacados
              </h2>
            </div>

            <button
              className="outline-button"
              onClick={() => navigate("/juegos")}
            >
              Ver todos →
            </button>

          </div>


          <div className="cards-grid">

            <article className="game-card">
              <div className="game-card-image">
                🎮
              </div>

              <div className="game-card-content">
                <span>ACCIÓN</span>
                <h3>Próximamente</h3>
                <p>
                  Descubrí nuevos juegos y agregalos
                  a tus favoritos.
                </p>

                <button onClick={() => navigate("/juegos")}>
                  Ver juego →
                </button>
              </div>
            </article>


            <article className="game-card">
              <div className="game-card-image">
                ⚔️
              </div>

              <div className="game-card-content">
                <span>AVENTURA</span>
                <h3>Próximamente</h3>
                <p>
                  Explorá nuestro catálogo de videojuegos.
                </p>

                <button onClick={() => navigate("/juegos")}>
                  Ver juego →
                </button>
              </div>
            </article>


            <article className="game-card">
              <div className="game-card-image">
                🏆
              </div>

              <div className="game-card-content">
                <span>COMPETITIVO</span>
                <h3>Próximamente</h3>
                <p>
                  Conocé los juegos que dominan los rankings.
                </p>

                <button onClick={() => navigate("/rankings")}>
                  Ver ranking →
                </button>
              </div>
            </article>

          </div>

        </section>


        {/* ================= RANKINGS ================= */}
        <section className="ranking-section">

          <div className="section-header">

            <div>
              <p className="section-label">
                TOP ZENKAI
              </p>

              <h2>
                🏆 Rankings
              </h2>
            </div>

            <button
              className="outline-button"
              onClick={() => navigate("/rankings")}
            >
              Ver ranking →
            </button>

          </div>


          <div className="ranking-list">

            <div className="ranking-item first">
              <strong>#1</strong>
              <span>🎮 Juego destacado</span>
              <b>9.8</b>
            </div>

            <div className="ranking-item">
              <strong>#2</strong>
              <span>⚔️ Juego destacado</span>
              <b>9.5</b>
            </div>

            <div className="ranking-item">
              <strong>#3</strong>
              <span>🔥 Juego destacado</span>
              <b>9.2</b>
            </div>

          </div>

        </section>


        {/* ================= NOTICIAS ================= */}
        <section className="content-section">

          <div className="section-header">

            <div>
              <p className="section-label">
                ACTUALIDAD
              </p>

              <h2>
                📰 Últimas noticias
              </h2>
            </div>

            <button
              className="outline-button"
              onClick={() => navigate("/noticias")}
            >
              Ver noticias →
            </button>

          </div>


          <div className="news-grid">

            <article className="news-card">
              <span>NOTICIAS</span>
              <h3>
                Las novedades de Zenkai Games
              </h3>
              <p>
                Próximamente vas a encontrar las últimas
                novedades del mundo gamer.
              </p>
            </article>

            <article className="news-card">
              <span>LANZAMIENTOS</span>
              <h3>
                Nuevos juegos
              </h3>
              <p>
                Mantente al día con los próximos lanzamientos.
              </p>
            </article>

          </div>

        </section>


        {/* ================= COMUNIDAD ================= */}
        <section className="community-section">

          <div>

            <p className="section-label">
              COMUNIDAD
            </p>

            <h2>
              Compartí tu pasión por los videojuegos.
            </h2>

            <p>
              Próximamente vas a poder interactuar con
              otros usuarios, compartir opiniones y
              participar en la comunidad Zenkai.
            </p>

          </div>

          <button
            className="primary-button"
            onClick={() => navigate("/comunidad")}
          >
            Entrar a la comunidad
          </button>

        </section>

      </main>


      {/* ================= FOOTER ================= */}
      <footer className="footer">

        <div>
          <strong>🎮 Zenkai Games</strong>
          <p>
            Tu portal al mundo gamer.
          </p>
        </div>

        <div>
          <p>
            © 2026 Zenkai Games
          </p>
        </div>

      </footer>

    </div>
  );
}

export default Home;