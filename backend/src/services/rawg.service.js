const RAWG_API_URL = "https://api.rawg.io/api";

const crearError = (code, message) => Object.assign(new Error(message), { code });

const obtenerApiKey = () => {
    const apiKey = process.env.RAWG_API_KEY?.trim();
    if (!apiKey) {
        throw crearError("RAWG_API_KEY_MISSING", "Falta configurar RAWG_API_KEY en el backend.");
    }
    return apiKey;
};

const mapearJuego = (juego) => ({
    rawgId: juego.id,
    nombre: juego.name || "",
    imagen: juego.background_image || "",
    genero: (juego.genres || []).map((genero) => genero.name).filter(Boolean).join(", "),
    plataformas: (juego.platforms || [])
        .map((item) => item.platform?.name)
        .filter((nombre, indice, nombres) => nombre && nombres.indexOf(nombre) === indice),
    fechaLanzamiento: juego.released || "",
});

export async function buscarJuegosRAWG(termino) {
    const url = new URL(`${RAWG_API_URL}/games`);
    url.searchParams.set("key", obtenerApiKey());
    url.searchParams.set("search", termino);
    url.searchParams.set("page_size", "8");

    const response = await fetch(url);
    if (!response.ok) {
        throw crearError("RAWG_REQUEST_FAILED", "El catálogo externo no respondió correctamente.");
    }

    const data = await response.json();
    return (data.results || []).map(mapearJuego);
}

export async function obtenerJuegoRAWG(rawgId) {
    const id = Number(rawgId);
    if (!Number.isInteger(id) || id < 1) {
        throw crearError("RAWG_GAME_NOT_FOUND", "Seleccioná un juego válido del catálogo externo.");
    }

    const url = new URL(`${RAWG_API_URL}/games/${id}`);
    url.searchParams.set("key", obtenerApiKey());

    const response = await fetch(url);
    if (response.status === 404) {
        throw crearError("RAWG_GAME_NOT_FOUND", "El juego seleccionado no aparece en el catálogo externo.");
    }
    if (!response.ok) {
        throw crearError("RAWG_REQUEST_FAILED", "No se pudo verificar el juego con el catálogo externo.");
    }

    const juego = await response.json();
    if (Number(juego.id) !== id || !juego.name) {
        throw crearError("RAWG_GAME_NOT_FOUND", "El juego seleccionado no aparece en el catálogo externo.");
    }

    return {
        ...mapearJuego(juego),
        descripcion: typeof juego.description_raw === "string" ? juego.description_raw.trim() : "",
    };
}