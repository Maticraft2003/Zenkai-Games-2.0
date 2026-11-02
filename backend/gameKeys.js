export const normalizarClaveJuego = (nombre) => (typeof nombre === "string" ? nombre : "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[‘’‛ʼ]/g, "'")
    .replace(/[‐‑‒–—―−]/g, "-")
    .toLocaleLowerCase();

export const TITULOS_JUEGOS_PERMITIDOS = new Set([
    "Minecraft",
    "GTA V",
    "Resident Evil 4",
    "Doom Eternal",
    "Mortal Kombat 1",
    "The Witcher 3: Wild Hunt",
    "Hollow Knight",
    "Hades",
    "Forza Horizon 5",
    "Call of Duty: Modern Warfare",
    "Silent Hill 2",
    "Persona 5",
    "Doom",
    "Devil May Cry 5",
    "World of Warcraft",
    "Outlast",
    "Resident Evil 7",
    "Baldur's Gate 3",
    "Darkest Dungeon",
    "Gran Turismo 7",
    "Mario Kart 8 Deluxe",
].map(normalizarClaveJuego));
