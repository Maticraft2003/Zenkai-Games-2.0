import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/useAuth";

const config = {
  noticias: { title: "Noticias", fields: ["titulo", "contenido", "imagen"], labels: ["Título", "Contenido", "Imagen (URL)"] },
  comentarios: { title: "Comunidad", fields: ["contenido"], labels: ["Comentario"] }
};

export default function ContentPage({ tipo = "noticias" }) {
  const { tipo = "noticias" } = useParams();
  const settings = config[tipo];
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ titulo: "", contenido: "", imagen: "" });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const admin = usuario?.role === "admin";

  async function load() {
    try {
      const { data } = await api.get(`/${tipo}`);
      setItems(data[tipo] || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo cargar el contenido.");
    }
  }
  useEffect(() => { if (settings) load(); }, [tipo]);

  if (!settings) return <main><h1>Sección no encontrada</h1><button onClick={() => navigate("/home")}>Volver</button></main>;

  function reset() { setForm({ titulo: "", contenido: "", imagen: "" }); setEditing(null); }
  function edit(item) { setEditing(item.id); setForm({ titulo: item.titulo || "", contenido: item.contenido || "", imagen: item.imagen || "" }); }
  async function save(event) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      if (editing) await api.put(`/${tipo}/${editing}`, form);
      else await api.post(`/${tipo}`, form);
      reset(); await load();
    } catch (err) { setError(err.response?.data?.mensaje || "No se pudo guardar."); }
    finally { setBusy(false); }
  }
  async function remove(id) {
    if (!window.confirm("¿Eliminar este contenido?")) return;
    try { await api.delete(`/${tipo}/${id}`); await load(); }
    catch (err) { setError(err.response?.data?.mensaje || "No se pudo eliminar."); }
  }

  return <main style={{ minHeight: "100vh", background: "#090909", color: "#fff", padding: "28px", textAlign: "left" }}>
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
      <h1 style={{ color: "#fff", fontSize: 36 }}>{settings.title}</h1>
      <button onClick={() => navigate("/home")}>Volver al inicio</button>
    </header>
    {error && <p role="alert" style={{ color: "#ff7777", margin: "12px 0" }}>{error}</p>}
    {admin && <form onSubmit={save} style={{ display: "grid", gap: 12, maxWidth: 760, margin: "24px 0", padding: 20, background: "#191919", border: "1px solid #5b1717", borderRadius: 12 }}>
      <h2>{editing ? "Editar contenido" : "Publicar contenido"}</h2>
      {settings.fields.map((field, index) => field === "contenido"
        ? <label key={field}>{settings.labels[index]}<textarea required rows={5} value={form[field]} onChange={e => setForm(v => ({ ...v, [field]: e.target.value }))} style={{ display: "block", width: "100%", marginTop: 6 }} /></label>
        : <label key={field}>{settings.labels[index]}<input required={field === "titulo"} value={form[field]} onChange={e => setForm(v => ({ ...v, [field]: e.target.value }))} style={{ display: "block", width: "100%", marginTop: 6 }} /></label>)}
      <div style={{ display: "flex", gap: 10 }}><button disabled={busy}>{busy ? "Guardando..." : editing ? "Guardar cambios" : "Publicar"}</button>{editing && <button type="button" onClick={reset}>Cancelar</button>}</div>
    </form>}
    <section style={{ display: "grid", gap: 16, maxWidth: 900 }}>
      {items.length === 0 && <p>Todavía no hay publicaciones.</p>}
      {items.map(item => <article key={item.id} style={{ padding: 20, border: "1px solid #333", borderRadius: 12, background: "#151515" }}>
        {item.imagen && <img src={item.imagen} alt="" style={{ maxWidth: "100%", maxHeight: 280, objectFit: "cover" }} />}
        {item.titulo && <h2 style={{ color: "#fff" }}>{item.titulo}</h2>}
        <p style={{ whiteSpace: "pre-wrap" }}>{item.contenido}</p>
        <small style={{ color: "#aaa" }}>{item.created_at || ""}</small>
        {admin && <div style={{ display: "flex", gap: 8, marginTop: 12 }}><button onClick={() => edit(item)}>Editar</button><button onClick={() => remove(item.id)}>Eliminar</button></div>}
      </article>)}
    </section>
  </main>;
}
