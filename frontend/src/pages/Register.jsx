import { useState } from "react";
import "./Login.css";

function Register() {

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

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
                />

                <button>

                    Crear cuenta

                </button>

            </div>

        </div>

    );

}

export default Register;