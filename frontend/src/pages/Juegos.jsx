import {useEffect,useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../context/useAuth";
import api from "../api";
import "./Juegos.css";

const empty={nombre:"",genero:"",etiqueta:"",plataforma:"",jugadores:"",imagen:"",descripcion:"",rawg_id:""};
export default function Juegos(){
 const {usuario,logout}=useAuth(),navigate=useNavigate();
 const [juegos,setJuegos]=useState([]),[form,setForm]=useState(empty),[editId,setEditId]=useState(null);
 const [open,setOpen]=useState(false),[query,setQuery]=useState(""),[results,setResults]=useState([]),[selected,setSelected]=useState(false);
 const [ratings,setRatings]=useState({}),[myRatings,setMyRatings]=useState({}),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 const admin=usuario?.role==="admin";
 async function load(){try{const {data}=await api.get("/games");setJuegos(data.juegos||[]);}catch(e){setError(e.response?.data?.mensaje||"No se pudieron cargar los juegos.");}}
 useEffect(()=>{load();},[]);
 useEffect(()=>{if(query.trim().length<2||selected){setResults([]);return;}const t=setTimeout(async()=>{try{const {data}=await api.get("/catalog/games",{params:{search:query}});setResults(data.resultados||[]);}catch(e){setError(e.response?.data?.mensaje||"No se pudo consultar el catálogo.");}},450);return()=>clearTimeout(t);},[query,selected]);
 useEffect(()=>{if(!usuario)return;let alive=true;Promise.all(juegos.map(async g=>{try{const {data}=await api.get(`/games/${g.id}/my-rating`);return[g.id,data.puntuacion];}catch{return[g.id,null];}})).then(rows=>{if(alive)setMyRatings(Object.fromEntries(rows));});return()=>{alive=false;};},[juegos,usuario]);
 function reset(){setForm(empty);setQuery("");setResults([]);setSelected(false);setEditId(null);setOpen(false);setError("");}
 function choose(g){setForm({...form,nombre:g.nombre,genero:g.genero||"Por definir",imagen:g.imagen||"",rawg_id:g.id,plataforma:form.plataforma||g.plataforma||""});setQuery(g.nombre);setResults([]);setSelected(true);}
 function edit(g){setEditId(g.id);setForm({nombre:g.nombre,genero:g.genero,etiqueta:g.etiqueta||"",plataforma:g.plataforma||"",jugadores:g.jugadores||"",imagen:g.imagen||"",descripcion:g.descripcion||"",rawg_id:g.rawg_id||""});setQuery(g.nombre);setSelected(Boolean(g.rawg_id));setOpen(true);setError("");}
 async function save(e){e.preventDefault();if(!selected||!form.rawg_id){setError("Buscá y seleccioná el juego en el catálogo antes de guardarlo.");return;}setBusy(true);setError("");try{if(editId)await api.put(`/games/${editId}`,form);else await api.post("/games",form);await load();reset();}catch(e){setError(e.response?.data?.mensaje||"No se pudo guardar el juego.");}finally{setBusy(false);}}
 async function remove(id){if(!confirm("¿Eliminar este juego?"))return;try{await api.delete(`/games/${id}`);await load();}catch(e){setError(e.response?.data?.mensaje||"No se pudo eliminar.");}}
 async function rate(id,score){try{const {data}=await api.post(`/games/${id}/ratings`,{puntuacion:score});setMyRatings(v=>({...v,[id]:score}));setJuegos(v=>v.map(g=>g.id===id?{...g,promedio:data.promedio,cantidad_votos:data.cantidad_votos}:g));}catch(e){setError(e.response?.data?.mensaje||"Iniciá sesión para valorar.");}}
 return <div className="games-page"><header className="games-nav"><strong onClick={()=>navigate("/home")}>🎮 Zenkai Games</strong><nav><button onClick={()=>navigate("/home")}>Inicio</button><button className="active">Juegos</button><button onClick={()=>logout()}>Cerrar sesión</button></nav></header>
 <main className="games-content"><div className="games-title"><div><p className="eyebrow">CATÁLOGO GAMER</p><h1>Explorá los juegos</h1><p>Descubrí títulos, consultá sus datos y dejá tu valoración.</p></div>{admin&&<button className="primary" onClick={()=>{reset();setOpen(true);}}>＋ Agregar juego</button>}</div>
 {error&&<p className="games-error" role="alert">{error}</p>}
 {open&&admin&&<div className="game-form-card"><div className="form-top"><h2>{editId?"Editar juego":"Agregar juego"}</h2><button onClick={reset}>✕</button></div><form onSubmit={save}><label className="wide">Nombre del juego<input placeholder="Agregar nombre del juego (ej. Minecraft)" value={query} onChange={e=>{setQuery(e.target.value);setSelected(false);setForm(v=>({...v,nombre:e.target.value,rawg_id:""}));}} required/></label>
 {!selected&&results.length>0&&<div className="catalog-results">{results.map(g=><button type="button" key={g.id} onClick={()=>choose(g)}><img src={g.imagen||""} alt=""/><span><b>{g.nombre}</b><small>{g.fecha||"Fecha no disponible"} · {g.genero||"Género no disponible"}</small></span></button>)}</div>}
 {!selected&&query.length>=2&&<small className="hint">Seleccioná el resultado correcto del catálogo para habilitar el guardado.</small>}
 <label>Género<input placeholder="Agregar género (ej. Acción, RPG)" value={form.genero} onChange={e=>setForm(v=>({...v,genero:e.target.value}))} required/></label>
 <label>Etiqueta<input placeholder="Agregar etiqueta (ej. Mundo abierto)" value={form.etiqueta} onChange={e=>setForm(v=>({...v,etiqueta:e.target.value}))}/></label>
 <label>Plataforma<input placeholder="Agregar plataforma (PC, PS5, Xbox...)" value={form.plataforma} onChange={e=>setForm(v=>({...v,plataforma:e.target.value}))} required/></label>
 <label>Jugadores<input placeholder="Cantidad de jugadores (ej. 1-4 / multijugador)" value={form.jugadores} onChange={e=>setForm(v=>({...v,jugadores:e.target.value}))} required/></label>
 <label className="wide">Imagen (URL)<input placeholder="Agregar URL de imagen" value={form.imagen} onChange={e=>setForm(v=>({...v,imagen:e.target.value}))}/></label>
 <label className="wide">Descripción<textarea placeholder="Agregar descripción del juego" value={form.descripcion} onChange={e=>setForm(v=>({...v,descripcion:e.target.value}))} required/></label>
 <div className="form-actions"><button type="button" onClick={reset}>Cancelar</button><button className="primary" disabled={busy||!selected||!form.rawg_id}>{busy?"Guardando...":editId?"Guardar cambios":"Agregar juego"}</button></div></form></div>}
 {juegos.length===0?<p className="empty-games">Todavía no hay juegos cargados.</p>:<div className="games-grid">{juegos.map(g=><article className="game-card" key={g.id}>{g.imagen&&<img className="game-cover" src={g.imagen} alt={g.nombre}/>}<div className="game-info"><div className="game-name"><h2>{g.nombre}</h2>{admin&&<div className="admin-actions"><button onClick={()=>edit(g)}>Editar</button><button onClick={()=>remove(g.id)}>Eliminar</button></div>}</div><p className="game-meta">{g.genero} {g.etiqueta&&"· "+g.etiqueta}</p><p><b>Plataforma:</b> {g.plataforma||"No especificada"}</p><p><b>Jugadores:</b> {g.jugadores||"No especificado"}</p><p className="description">{g.descripcion}</p><div className="rating-line"><div className="stars-display" aria-label={`Promedio ${g.promedio} de 5`}>{"★".repeat(Math.round(g.promedio||0))}<span>{"★".repeat(5-Math.round(g.promedio||0))}</span></div><b>{Number(g.promedio||0).toFixed(2)}/5</b><small>({g.cantidad_votos||0} votos)</small></div><div className="your-rating"><span>Tu valoración:</span>{[1,2,3,4,5].map(n=><button key={n} className={n<=(myRatings[g.id]||0)?"chosen":""} onClick={()=>rate(g.id,n)} aria-label={`Valorar con ${n} estrellas`}>★</button>)}</div></div></article>)}</div>}<p className="rawg-credit">Datos e imágenes de juegos: <a href="https://rawg.io" target="_blank" rel="noreferrer">RAWG</a>.</p></main></div>;
}
