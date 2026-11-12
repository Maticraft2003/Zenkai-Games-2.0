import {useNavigate} from "react-router-dom";
import {useAuth} from "../context/useAuth";
import ParticlesBackground from "../components/ParticlesBackground";
export default function Home(){
 const navigate=useNavigate();const {logout,usuario}=useAuth();
 return <div className="App" style={{position:"relative",minHeight:"100vh",overflow:"hidden"}}>
  <ParticlesBackground/>
  <div style={{position:"relative",zIndex:1}}>
   <header className="navbar"><div className="logo"><h1>Zenkai Games</h1></div>
    <nav><ul className="menu">
     <li><button onClick={()=>navigate("/home")}>Inicio</button></li>
     <li><button onClick={()=>navigate("/juegos")}>Juegos</button></li>
     <li><a href="#rankings">Rankings</a></li><li><button onClick={()=>navigate("/noticias")}>Noticias</button></li><li><button onClick={()=>navigate("/comunidad")}>Comunidad</button></li><li><a href="#acerca-de">Acerca de</a></li>
    </ul></nav>
    <div className="login"><span>{usuario?.username}</span><button onClick={logout}>🚪 Cerrar sesión</button></div>
   </header>
   <main><h1>Bienvenido a Zenkai Games</h1><p>Tu portal al mundo gamer.</p><button onClick={()=>navigate("/juegos")}>Explorar catálogo de juegos</button></main>
  </div>
 </div>;
}
