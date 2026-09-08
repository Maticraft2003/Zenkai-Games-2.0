import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router";
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


       *Juegos*
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
                <span>Supervivencia</span>
                <h3>Minecraft</h3>
                <p>
                  Explorá, construí y sobreviví en un mundo 
                  abierto lleno de aventuras y prácticamente sin límites.
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
                <span>Acción</span>
                <h3>Grand theft Auto VI</h3>
                <p>
                  Sumérgete en la ciudad de Los Santos 
                  y vive la experiencia de un crimen organizado.
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
                <span>Terror</span>
                <h3>Resident Evil 4</h3>
                <p>
                  Acompaña a Leon S. Kennedy en su misión de rescatar
                  a la hija del presidente de los Estados Unidos 
                  en un pueblo rural de España.
                </p>

                <button onClick={() => navigate("/rankings")}>
                  Ver ranking →
                </button>
              </div>
            </article>

          </div>

        </section>


       *Rankings*
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
              <span>Minecraft</span>
              <b>9.8</b>
            </div>

            <div className="ranking-item">
              <strong>#2</strong>
              <span>Grand theft Auto VI</span>
              <b>9.5</b>
            </div>

            <div className="ranking-item">
              <strong>#3</strong>
              <span>Resident Evil 4</span>
              <b>9.2</b>
            </div>

          </div>

        </section>


        *Noticias*
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
              <span>Actualidad</span>
              <h3>
                Zenkai Games ya está en desarrollo
              </h3> 
              <p>
                Conocé las novedades, mejoras y nuevas funcionalidades que llegaran al proyecto.
              </p>
            </article>

            <article className="news-card">
              <span>Videojuegos</span>
              <h3>
                Los videojuegos más destacados y esperados del año.
              </h3>
              <p>
                Explorá nuestro catálogo y descubrí títulos
                populares de diferentes géneros.
              </p>
            </article>

          </div>

        </section>


        *Comunidad*
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


     *Footer*
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