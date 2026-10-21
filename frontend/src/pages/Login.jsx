import { useAuth } from "../context/useAuth";
import axios from "axios";
import { useNavigate } from "react-router";
import { useState } from "react";
import "./Login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState("");
  const [iniciandoSesion, setIniciandoSesion] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const iniciarSesion = async (evento) => {
    evento.preventDefault();
    setError("");

    try {
      setIniciandoSesion(true);
      const respuesta = await axios.post(
        "http://localhost:3001/login",
        {
          email: email.trim(),
          password
        }
      );

      if (respuesta.data.success) {
        login(respuesta.data.usuario);
        navigate("/home");
      } else {
        setError(respuesta.data.mensaje || "Correo o contraseña incorrectos.");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setError(
        error.response?.data?.mensaje
          || (error.response
            ? `El servidor respondió con un error (HTTP ${error.response.status}). Intentá nuevamente.`
            : "No hay conexión con el servidor. Verificá que el backend esté iniciado en el puerto 3001.")
      );
    } finally {
      setIniciandoSesion(false);
    }
  };

  return (
    <div className="login-container">

      <div className="login-box auth-box">

        <h1>Zenkai Games</h1>

        <p className="subtitle">
          Tu portal al mundo gamer
        </p>

        <p className="auth-heading">Inicia sesión</p>

        <form className="auth-form" onSubmit={iniciarSesion}>
          <label className="auth-field">
            <span>Correo electrónico</span>
            <input
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="auth-field">
            <span>Contraseña</span>
            <div className="auth-password-control">
              <input
                type={mostrarPassword ? "text" : "password"}
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={mostrarPassword}
                onClick={() => setMostrarPassword((visible) => !visible)}
              >
                {mostrarPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </label>

          {error ? <p className="auth-error" role="alert">{error}</p> : null}

          <button type="submit" className="login-button" disabled={iniciandoSesion}>
            {iniciandoSesion ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <button
          className="register-button"
          onClick={() => navigate("/register")}
        >
          Registrarme 
        </button>

      </div>

    </div>
  );
}

export default Login;