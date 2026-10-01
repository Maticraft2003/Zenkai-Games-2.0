import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Juegos from "./pages/Juegos";
import SectionPage from "./pages/SectionPage";
import { Routes, Route, Navigate } from "react-router";
import { useAuth } from "./context/useAuth";

function App() {
  const { usuario } = useAuth();

  const protegerRuta = (element) => (usuario ? element : <Navigate to="/" replace />);

  return (
    <Routes>
      {/* LOGIN */}
      <Route
        path="/"
        element={
          usuario ? (
            <Navigate to="/home" replace />
          ) : (
            <Login />
          )
        }
      />

      {/* REGISTRO */}
      <Route
        path="/register"
        element={
          usuario ? (
            <Navigate to="/home" replace />
          ) : (
            <Register />
          )
        }
      />

      {/* HOME */}
      <Route path="/home" element={protegerRuta(<Home />)} />

      {/* SECCIONES */}
      <Route path="/juegos" element={protegerRuta(<Juegos />)} />

      <Route
        path="/rankings"
        element={protegerRuta(
          <SectionPage
            type="rankings"
            title="Rankings"
            subtitle="Los mejores juegos del momento, ordenados por comunidad y calidad."
          />
        )}
      />

      <Route
        path="/noticias"
        element={protegerRuta(
          <SectionPage
            type="noticias"
            title="Noticias"
            subtitle="Enterate de lanzamientos, actualizaciones y novedades del sector."
          />
        )}
      />

      <Route
        path="/comunidad"
        element={protegerRuta(
          <SectionPage
            type="comunidad"
            title="Comunidad"
            subtitle="Compartí opiniones, descubrí groups y participá del mundo gamer."
          />
        )}
      />

      <Route
        path="/perfil"
        element={protegerRuta(
          <SectionPage
            type="perfil"
            title="Mi perfil"
            subtitle="Controlá tu cuenta, actividad y preferencias del sitio."
          />
        )}
      />

      <Route
        path="/acerca-de"
        element={protegerRuta(
          <SectionPage
            type="acerca-de"
            title="Acerca de"
            subtitle="Zenkai Games nació para crear una comunidad gamer moderna y divertida."
          />
        )}
      />

      <Route path="/acerca" element={<Navigate to="/acerca-de" replace />} />

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;