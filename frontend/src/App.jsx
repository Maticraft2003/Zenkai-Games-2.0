import Register from "./pages/Register";
import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";

function App() {

  // Busca si hay un usuario guardado
  const usuario = localStorage.getItem("usuario");

  return (
    <Routes>
      {/* Si NO hay usuario -> Register */}
    <Route
      path="/register"
      element={<Register />}
     />

      {/* Si hay usuario -> Login */}
      <Route
        path="/"
        element={usuario ? <Navigate to="/home" /> : <Login />}
      />

      {/* Si hay usuario -> Home */}
      <Route
        path="/home"
        element={usuario ? <Home /> : <Navigate to="/" />}
      />

    </Routes>
  );
}

export default App;