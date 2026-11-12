import {useState} from "react";
import {useNavigate} from "react-router-dom";
import api from "../api";
import "./Login.css";
export default function Register(){
 const [username,setUsername]=useState("");const [email,setEmail]=useState("");const [password,setPassword]=useState("");const [error,setError]=useState("");const [busy,setBusy]=useState(false);const navigate=useNavigate();
 const submit=async(e)=>{e.preventDefault();setError("");setBusy(true);try{await api.post("/auth/register",{username,email,password});alert("Cuenta creada. Ahora podés iniciar sesión.");navigate("/");}catch(err){setError(err.response?.data?.mensaje||"No se pudo crear la cuenta.");}finally{setBusy(false);}};
 return <div className="login-container"><form className="login-box" onSubmit={submit}><h1>Zenkai Games</h1><h2>Crear cuenta</h2>{error&&<p role="alert" className="form-error">{error}</p>}<input type="text" placeholder="Nombre de usuario" value={username} onChange={e=>setUsername(e.target.value)} required/><input type="email" placeholder="Correo electrónico" value={email} onChange={e=>setEmail(e.target.value)} required/><input type="password" placeholder="Contraseña (mínimo 8 caracteres)" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required/><button className="login-button" disabled={busy}>{busy?"Creando...":"Crear cuenta"}</button><button type="button" onClick={()=>navigate("/")}>Volver al inicio de sesión</button></form></div>;
}
