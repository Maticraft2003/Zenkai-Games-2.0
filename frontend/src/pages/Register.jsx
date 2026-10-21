import axios from "axios";
import { useNavigate } from "react-router";
import { useState } from "react";
import "./Login.css";

function Register() {

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [registrando, setRegistrando] = useState(false);
    const navigate = useNavigate();

    const registrarUsuario = async (evento) => {
    evento.preventDefault();
    setError("");

    if (password.length < 8 || new TextEncoder().encode(password).length > 72) {
        setError("La contraseña debe tener al menos 8 caracteres y no superar los 72 bytes.");
        return;
    }

    try {
        setRegistrando(true);

        const respuesta = await axios.post(
            "http://localhost:3001/register",
            {
                username: username.trim(),
                email: email.trim(),
                password
            }
        );

        if (respuesta.data.success) {

            alert("Cuenta creada correctamente.");

            navigate("/");

        } else {

            setError(respuesta.data.mensaje || "No se pudo crear la cuenta.");

        }

    } catch (error) {

        console.error("Error al registrar la cuenta:", error);
        setError(
            error.response?.data?.mensaje
                || (error.response
                    ? `El servidor respondió con un error (HTTP ${error.response.status}). Intentá nuevamente.`
                    : "No hay conexión con el servidor. Verificá que el backend esté iniciado en el puerto 3001.")
        );

    } finally {
        setRegistrando(false);
    }

};

    return (

        <div className="login-container">

            <div className="login-box register-box">

                <h1>Zenkai Games</h1>

                <p className="register-heading">Crear cuenta</p>

                <form className="register-form" onSubmit={registrarUsuario}>
                    <label className="register-field">
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

                    <label className="register-field">
                        <span>Nombre de usuario</span>
                        <input
                            type="text"
                            placeholder="¿Cómo te llamamos?"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                            required
                        />
                    </label>

                    <label className="register-field">
                        <span>Contraseña</span>
                        <input
                            type="password"
                            placeholder="Mínimo 8 caracteres"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            minLength={8}
                            maxLength={72}
                            required
                        />
                    </label>

                    {error ? <p className="auth-error" role="alert">{error}</p> : null}

                    <button type="submit" className="login-button" disabled={registrando}>
                        {registrando ? "Creando cuenta..." : "Crear cuenta"}
                    </button>
                </form>

            </div>

        </div>

    );

}

export default Register;