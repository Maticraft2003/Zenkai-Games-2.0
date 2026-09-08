import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/useAuth";

function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const cerrarSesion = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">

      <div className="navbar-logo">
        <span className="logo-icon">🎮</span>
        <span>Zenkai Games</span>
      </div>

      <nav>
        <ul className="menu">
          <li>
            <Link to="/home">Inicio</Link>
          </li>

          <li>
            <Link to="/juegos">Juegos</Link>
          </li>

          <li>
            <Link to="/rankings">Rankings</Link>
          </li>

          <li>
            <Link to="/noticias">Noticias</Link>
          </li>

          <li>
            <Link to="/comunidad">Comunidad</Link>
          </li>

          <li>
            <Link to="/acerca-de">Acerca de</Link>
          </li>
        </ul>
      </nav>

      <div className="navbar-actions">
        <Link to="/perfil" className="profile-button">
          Mi Perfil
        </Link>

        <button className="logout-button" onClick={cerrarSesion}>
          🚪 Salir
        </button>
      </div>

    </header>
  );
}

export default Navbar;