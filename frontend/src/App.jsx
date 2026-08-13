import "./App.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";

import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./context/useAuth";

function App() {
  const { usuario } = useAuth();

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
      <Route
        path="/home"
        element={
          usuario ? (
            <Home />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

    </Routes>
  );
}

export default App;