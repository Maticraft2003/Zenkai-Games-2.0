import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import ParticlesBackground from "../components/ParticlesBackground";

function Home() {
  const navigate = useNavigate();

  const { logout } = useAuth();   

  const cerrarSesion = () => {    
    logout();
    navigate("/");
  };
  return (
    <div className="App" style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <ParticlesBackground />

      <div style={{ position: "relative", zIndex: 1 }}>
        <h1>Bienvenido a Zenkai Games</h1>

        <header className="navbar">
          <div className="logo">
            <h1>Zenkai Games</h1>
          </div>
          <div>
            <p>Login correcto 🎉</p>
          </div>

          <nav>
            <ul className="menu">
              <li><a href="#inicio">Inicio</a></li>
              <li><a href="#juegos">Juegos</a></li>
              <li><a href="#rankings">Rankings</a></li>
              <li><a href="#noticias">Noticias</a></li>
              <li><a href="#comunidad">Comunidad</a></li>
              <li><a href="#acerca-de">Acerca de</a></li>
            </ul>
          </nav>

          <button onClick={cerrarSesion}>🚪 Cerrar sesión</button>

          <div className="login">
            <button>Mi Perfil</button>
          </div>
        </header>

        <main>
          {/* Banner Principal */}
          {/* Juegos Destacados */}
          {/* Recomendaciones */}
          {/* Rankings */}
        </main>

        <footer>
          {/* Pie de pagina */}
        </footer>
      </div>
    </div>
  );
}

export default Home