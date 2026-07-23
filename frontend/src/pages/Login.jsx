import ParticlesBackground from "../components/ParticlesBackground";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");  
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const navigate = useNavigate();
  const iniciarSesion = async () => {

    try {

        const respuesta = await axios.post(
            "http://localhost:3001/login",
            {
                email,
                password
            }
        );

       if (respuesta.data.success) {

            localStorage.setItem(
                "usuario",
                JSON.stringify(respuesta.data.usuario)
           );

           navigate("/home");

}
 
         else {

            alert("Correo o contraseña incorrectos");

        }

    } catch (error) {

        console.error(error);
        alert("No se pudo conectar con el servidor.");

    }

};
    
  return (
    <div className="login-container">

    <ParticlesBackground /> 

    <div className="login-box">
        
            <h1>Zenkai Games</h1>
            <p className="subtitle">
            Tu portal al mundo gamer
            </p>
            <p>Inicia sesión</p>
            <p>¿No tenés una cuenta?</p>

              <button
                  className="register-link"
                  onClick={() => navigate("/register")}
                >

                   Registrarme

              </button>
            <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <div className="password-container">
            <input
                type={mostrarPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
               <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
>
                    {mostrarPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          <button
           className="login-button"
           onClick={iniciarSesion}
          >
           Iniciar sesión
          </button>
        </div>
    </div>
  );
}
export default Login;