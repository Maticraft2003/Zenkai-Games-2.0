import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../context/useAuth";
import api from "../api";
import {FaEye,FaEyeSlash} from "react-icons/fa";
import "./Login.css";
export default function Login(){
 const [email,setEmail]=useState("");const [password,setPassword]=useState("");const [show,setShow]=useState(false);const [error,setError]=useState("");const [busy,setBusy]=useState(false);
 const {login}=useAuth();const navigate=useNavigate();
 const submit=async(e)=>{e.preventDefault();setError("");setBusy(true);try{const {data}=await api.post("/auth/login",{email,password});login(data);navigate("/home");}catch(err){setError(err.response?.data?.mensaje||"No se pudo conectar con el servidor.");}finally{setBusy(false);}};
 return <div className="login-container"><form className="login-box" onSubmit={submit}><h1>Zenkai Games</h1><p className="subtitle">Tu portal al mundo gamer</p><h2>Iniciar sesión</h2>{error&&<p role="alert" className="form-error">{error}</p>}<input type="email" placeholder="Correo electrónico" value={email} onChange={e=>setEmail(e.target.value)} required/><div className="password-container"><input type={show?"text":"password"} placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} required/><button type="button" onClick={()=>setShow(!show)} aria-label={show?"Ocultar contraseña":"Mostrar contraseña"}>{show?<FaEyeSlash/>:<FaEye/>}</button></div><button className="login-button" disabled={busy}>{busy?"Ingresando...":"Iniciar sesión"}</button><button type="button" className="register-button" onClick={()=>navigate("/register")}>Crear cuenta</button></form></div>;
}
