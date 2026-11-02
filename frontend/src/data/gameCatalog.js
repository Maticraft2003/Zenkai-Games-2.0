import { normalizarClaveJuego } from "../utils/gameKey";

const catalogoJuegos = [
  {
    nombre: "Minecraft",
    genero: "Sandbox",
    etiqueta: "Juego de sandbox",
    imagen: "https://images2.alphacoders.com/137/thumb-1920-1370592.jpeg",
    descripcion: "Reuní recursos, construí tu propio mundo y explorá biomas llenos de criaturas, desafíos y secretos.",
  },
  {
    nombre: "GTA V",
    genero: "Acción",
    etiqueta: "Mundo abierto",
    imagen: "https://cdn.wallpapersafari.com/92/89/S1KxLt.jpg",
    descripcion: "Recorré Los Santos en una historia de tres protagonistas, misiones variadas y actividades para un jugador.",
  },
  {
    nombre: "Resident Evil 4",
    genero: "Terror",
    etiqueta: "Survival horror",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPfy213xBg46vWZjw04FLLIJvzmuG8g7X5wAuPvXX3VJAMHU75",
    descripcion: "Acompañá a Leon en una misión de rescate que combina exploración, gestión de recursos y combate contra amenazas.",
  },
  {
    nombre: "Doom Eternal",
    genero: "Shooter",
    etiqueta: "Shooter de acción",
    imagen: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTLEzjM1fn9G1nsXTbaI4oKtuacL-1PT0xvKMG8TEcvIUtAj4qd",
    descripcion: "Enfrentá una invasión demoníaca con combates veloces, un arsenal variado y exploración en escenarios infernales.",
  },
  {
    nombre: "Mortal Kombat 1",
    genero: "Lucha/Peleas",
    etiqueta: "Peleas/sangriento",
    imagen: "https://preview.redd.it/mortal-kombat-1-screenshots-i-honestly-like-it-v0-pirl215zotyd1.jpg?width=1080&crop=smart&auto=webp&s=81d13f4df19466e9715488417a535356f6399176",
    descripcion: "Descubrí una nueva era de Mortal Kombat y enfrentá combates uno contra uno con luchadores y estilos distintos.",
  },
  {
    nombre: "The Witcher 3: Wild Hunt",
    genero: "RPG",
    etiqueta: "RPG de mundo abierto",
    imagen: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQt7QwNsxC0h8M9-k3qWKzg31jLBjWgPyoUnNlSlPGilX0LmTTd",
    descripcion: "Seguí a Geralt de Rivia en una aventura de rol con contratos de monstruos, decisiones y exploración de mundo abierto.",
  },
  {
    nombre: "Hollow Knight",
    genero: "Metroidvania",
    etiqueta: "Aventura indie",
    imagen: "https://i.pinimg.com/736x/e4/6c/d9/e46cd932609864801ce2ae8312faf855.jpg",
    descripcion: "Explorá el reino subterráneo de Hallownest en una aventura de acción, plataformas y combates desafiantes.",
  },
  {
    nombre: "Hades",
    genero: "Roguelike",
    etiqueta: "Roguelike de acción",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQs8c0h4-uK6k2EUYHHaQiWE9uuYfvX153YFOh5ufRiS5HBdbo-",
    descripcion: "Intentá escapar del inframundo griego en combates ágiles donde cada partida aporta nuevas armas, mejoras e historia.",
  },
  {
    nombre: "Forza Horizon 5",
    genero: "Carreras",
    etiqueta: "Carreras de mundo abierto",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQL4hKrZ65FtYq3g4eUmzbfxPdkf-zfIhyNBw_X2ojLqm2-cOQo4OKfo3w&s=10",
    descripcion: "Conducí cientos de vehículos por los paisajes de México y participá en carreras y eventos de mundo abierto.",
  },
  {
    nombre: "Call of Duty: Modern Warfare",
    genero: "Shooter",
    etiqueta: "Shooter bélico",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4PLmaGZ0Em7n9rFMRV78AWcioQTfWIdUwjfjStXnTrXyvw3k2vwetD5l3&s=10",
    descripcion: "Viví una campaña de acción militar moderna con operaciones tácticas y una historia centrada en conflictos globales.",
  },
  {
    nombre: "Silent Hill 2",
    genero: "Terror",
    etiqueta: "Horror psicológico",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6xsyiSHQPtRwEOmuq0xi3AxRKIvvklqCjpslCUB4N8Y83ITj7hVEA_go&s=10",
    descripcion: "Regresá a Silent Hill junto a James Sunderland y explorá una ciudad envuelta en niebla y misterio psicológico.",
  },
  {
    nombre: "Persona 5",
    genero: "RPG",
    etiqueta: "RPG japonés",
    imagen: "https://m.media-amazon.com/images/M/MV5BNWRmYzE4NzAtY2Q5My00Mjc1LWJhNDgtMmRmNGQzMzMyYTJkXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    descripcion: "Liderá a los Ladrones Fantasma entre la vida escolar de Tokio y mazmorras donde el combate por turnos premia la estrategia.",
  },
  {
    nombre: "Doom",
    genero: "Shooter",
    etiqueta: "Shooter clásico",
    imagen: "https://i.blogs.es/fc7ae1/doom-1/450_1000.webp",
    descripcion: "Abrite paso entre demonios en el clásico shooter en primera persona que dio forma a la acción rápida y directa.",
  },
  {
    nombre: "Devil May Cry 5",
    genero: "Hack and Slash",
    etiqueta: "Acción y combos",
    imagen: "https://cdn.mos.cms.futurecdn.net/xDhhYzmU9GvdH9pRFzpf9T.jpg",
    descripcion: "Alterná entre Nero, Dante y V para enfrentar demonios con armas y estilos de combate únicos.",
  },
  {
    nombre: "World of Warcraft",
    genero: "MMORPG",
    etiqueta: "Rol en línea",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7pALTskfSABdHirWcyFQWp8pW7BIRacoQMIFiBt39LmcghtfWXA2EG8Jk&s=10",
    descripcion: "Explorá Azeroth, completá misiones y formá equipo para enfrentar mazmorras y bandas en este MMORPG.",
  },
  {
    nombre: "Outlast",
    genero: "Terror",
    etiqueta: "Supervivencia y terror",
    imagen: "https://store-images.s-microsoft.com/image/apps.52001.67759939744253232.91d27dff-a27e-44ea-9d15-3d3fc6acfd00.841c08cf-c100-4be3-abee-b444a2304b90",
    descripcion: "Investigá un sanatorio abandonado con una cámara de visión nocturna mientras buscás escapar sin poder defenderte.",
  },
  {
    nombre: "Resident Evil 7",
    genero: "Terror",
    etiqueta: "Terror en primera persona",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaOo4xSmuY74eXCv5aw6qJohrwN1yeGVky4O8RaxE1PUysfVVdphgF_ra_&s=10",
    descripcion: "Explorá la casa de los Baker desde una perspectiva en primera persona y resolvé cómo sobrevivir al horror.",
  },
  {
    nombre: "Baldur's Gate 3",
    genero: "RPG",
    etiqueta: "Rol y aventura",
    imagen: "https://store-images.s-microsoft.com/image/apps.11593.13550459053619040.9c555c73-a698-4992-b0f3-c5084cf18b5e.82a9ea41-c628-4d02-8a0f-d0304eba31c7",
    descripcion: "Reuní un grupo y decidí cómo avanzar en esta aventura de rol basada en reglas de Dungeons & Dragons.",
  },
  {
    nombre: "Darkest Dungeon",
    genero: "RPG",
    etiqueta: "Rol táctico",
    imagen: "https://i.ytimg.com/vi/MBo4rwZERM8/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLC3MfenD3cSjkm5LyjPYhGtd6Y2Tg",
    descripcion: "Organizá expediciones por ruinas peligrosas y administrá el estrés de un grupo en combates por turnos.",
  },
  {
    nombre: "Gran Turismo 7",
    genero: "Carreras",
    etiqueta: "Simulación de carreras",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUcvOyyAlvqigMnoErl9Nz42Hm6SfiFwUykJ2jMw0k42am48w1cGIeuDo&s=10",
    descripcion: "Perfeccioná tu conducción en circuitos y campeonatos con una amplia colección de autos y opciones de simulación.",
  },
  {
    nombre: "Mario Kart 8 Deluxe",
    genero: "Carreras",
    etiqueta: "Carreras arcade",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5ktG_YR7ldiyaWxzsQK1DHU9ljqq2tGHVU_jko9KkQz-MQM2a3LSVMl1O&s=10",
    descripcion: "Competí en circuitos llenos de atajos y objetos, en carreras arcade para jugar en solitario o con amigos.",
  },
];

const descripcionesAdicionales = new Map([
  ["the witcher 3", "Seguí a Geralt de Rivia en una aventura de rol con contratos de monstruos, decisiones y exploración de mundo abierto."],
  ["baldur´s gate 3", "Reuní un grupo y decidí cómo avanzar en esta aventura de rol basada en reglas de Dungeons & Dragons."],
]);

export function obtenerDescripcionJuego(nombre) {
  if (typeof nombre !== "string" || !nombre.trim()) return null;

  const clave = normalizarClaveJuego(nombre);
  const juegoCatalogo = catalogoJuegos.find(
    (juego) => normalizarClaveJuego(juego.nombre) === clave
  );
  return juegoCatalogo?.descripcion || descripcionesAdicionales.get(clave) || null;
}

export function buscarJuegoEnCatalogo(nombre) {
  const nombreNormalizado = normalizarClaveJuego(nombre);

  if (!nombreNormalizado) return null;

  return catalogoJuegos.find((juego) => {
    return normalizarClaveJuego(juego.nombre) === nombreNormalizado;
  }) || null;
}

export default catalogoJuegos;
