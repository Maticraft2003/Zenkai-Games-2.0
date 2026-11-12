const RAWG_URL = "https://api.rawg.io/api/games";
export async function searchGames(query) {
  const key = process.env.RAWG_API_KEY;
  if (!key) { const e = new Error("Falta configurar RAWG_API_KEY en el .env del backend."); e.status=503; throw e; }
  const url = new URL(RAWG_URL);
  url.searchParams.set("key", key); url.searchParams.set("search", query);
  url.searchParams.set("search_precise", "true"); url.searchParams.set("page_size", "8");
  const response = await fetch(url);
  if (!response.ok) { const e = new Error("El catálogo externo no está disponible."); e.status=502; throw e; }
  const data = await response.json();
  return (data.results || []).map(g => ({
    id:g.id, nombre:g.name, genero:(g.genres||[]).map(x=>x.name).join(", "),
    imagen:g.background_image||"", fecha:g.released||"",
    plataforma:(g.platforms||[]).map(x=>x.platform?.name).filter(Boolean).join(", ")
  }));
}
export async function validateCatalogGame(rawgId, nombre) {
  const results = await searchGames(nombre);
  const game = results.find(g=>String(g.id)===String(rawgId));
  if (!game || game.nombre.trim().toLowerCase()!==nombre.trim().toLowerCase()) {
    const e = new Error("Elegí el juego exacto desde los resultados del catálogo."); e.status=422; throw e;
  }
  return game;
}
