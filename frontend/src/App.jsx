import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Juegos from "./pages/Juegos";
import ContentPage from "./pages/ContentPage";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/useAuth";

function App() {
  const { usuario } = useAuth();
  const protectedPage = (element) => usuario ? element : <Navigate to="/" replace />;
  return (
    <Routes>
      <Route path="/" element={usuario ? <Navigate to="/home" replace /> : <Login />} />
      <Route path="/register" element={usuario ? <Navigate to="/home" replace /> : <Register />} />
      <Route path="/home" element={protectedPage(<Home />)} />
      <Route path="/juegos" element={protectedPage(<Juegos />)} />
      <Route path="/noticias" element={protectedPage(<ContentPage tipo="noticias" />)} />
      <Route path="/comunidad" element={protectedPage(<ContentPage tipo="comentarios" />)} />
      <Route path="*" element={<Navigate to={usuario ? "/home" : "/"} replace />} />
    </Routes>
  );
}
export default App;
