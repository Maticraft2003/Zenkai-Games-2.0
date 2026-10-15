import axios from "axios";
import { useNavigate } from "react-router";
import { useState } from "react";
import "./Login.css";

function Register() {

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const registrarUsuario = async () => {

    if (password.length < 8 || new TextEncoder().encode(password).length > 72) {
        alert("La contraseña debe tener al menos 8 caracteres y no superar los 72 bytes.");
        return;
    }

    try {

        const respuesta = await axios.post(
            "http://localhost:3001/register",
            {
                username,
                email,
                password
            }
        );

        if (respuesta.data.success) {

            alert("Cuenta creada correctamente.");

            navigate("/");

        } else {

            alert(respuesta.data.mensaje);

        }

    } catch (error) {

        console.error(error);

        alert("No se pudo conectar con el servidor.");

    }

};

    return (

        <div className="login-container">

            <div className="login-box">

                <h1>Zenkai Games</h1>

                <p>Crear cuenta</p>

                <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Nombre de usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    maxLength={72}
                    required
                />

                <button
                    onClick={registrarUsuario}
                >
                Crear cuenta

                </button>

            </div>

        </div>

    );

}

export default Register;