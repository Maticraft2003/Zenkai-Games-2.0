const catalogoJuegos = [
  {
    nombre: "Minecraft",
    genero: "Sandbox",
    etiqueta: "Juego de sandbox",
    imagen: "https://images2.alphacoders.com/137/thumb-1920-1370592.jpeg",
    descripcion: "Creatividad infinita, construcciones épicas y experiencias cooperativas sin fin.",
  },
  {
    nombre: "GTA V",
    genero: "Acción",
    etiqueta: "Mundo abierto",
    imagen: "https://cdn.wallpapersafari.com/92/89/S1KxLt.jpg",
    descripcion: "Mundo abierto, misiones intensas, libertad completa y una jugabilidad enorme.",
  },
  {
    nombre: "Resident Evil 4",
    genero: "Terror",
    etiqueta: "Survival horror",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPfy213xBg46vWZjw04FLLIJvzmuG8g7X5wAuPvXX3VJAMHU75",
    descripcion: "Tensión constante, supervivencia brutal y una atmósfera increíblemente inmersiva.",
  },
  {
    nombre: "Doom Eternal",
    genero: "Shooter",
    etiqueta: "Shooter de acción",
    imagen: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTLEzjM1fn9G1nsXTbaI4oKtuacL-1PT0xvKMG8TEcvIUtAj4qd",
    descripcion: "Acción frenética, armas brutales y un ritmo que no te deja respirar.",
  },
  {
    nombre: "Mortal Kombat 1",
    genero: "Lucha/Peleas",
    etiqueta: "Peleas/sangriento",
    imagen: "https://preview.redd.it/mortal-kombat-1-screenshots-i-honestly-like-it-v0-pirl215zotyd1.jpg?width=1080&crop=smart&auto=webp&s=81d13f4df19466e9715488417a535356f6399176",
    descripcion: "Peleas intensas, combos explosivos y una presentación visual brutal.",
  },
  {
    nombre: "The Witcher 3: Wild Hunt",
    genero: "RPG",
    etiqueta: "RPG de mundo abierto",
    imagen: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQt7QwNsxC0h8M9-k3qWKzg31jLBjWgPyoUnNlSlPGilX0LmTTd",
    descripcion: "Historia profunda, decisiones importantes y un mundo enorme lleno de detalle.",
  },
  {
    nombre: "Hollow Knight",
    genero: "Metroidvania",
    etiqueta: "Aventura indie",
    imagen: "https://i.pinimg.com/736x/e4/6c/d9/e46cd932609864801ce2ae8312faf855.jpg",
    descripcion: "Exploración magistral, un arte precioso y un desafío más que satisfactorio.",
  },
  {
    nombre: "Hades",
    genero: "Roguelike",
    etiqueta: "Roguelike de acción",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQs8c0h4-uK6k2EUYHHaQiWE9uuYfvX153YFOh5ufRiS5HBdbo-",
    descripcion: "Partidas dinámicas, mejora de habilidades y una historia muy bien ejecutada.",
  },
  {
    nombre: "Forza Horizon 5",
    genero: "Carreras",
    etiqueta: "Carreras de mundo abierto",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQL4hKrZ65FtYq3g4eUmzbfxPdkf-zfIhyNBw_X2ojLqm2-cOQo4OKfo3w&s=10",
    descripcion: "Exploración de mundo abierto, variedad de vehículos y eventos emocionantes.",
  },
  {
    nombre: "Call of Duty: Modern Warfare",
    genero: "Shooter",
    etiqueta: "Shooter bélico",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4PLmaGZ0Em7n9rFMRV78AWcioQTfWIdUwjfjStXnTrXyvw3k2vwetD5l3&s=10",
    descripcion: "Campaña cinematográfica, multijugador competitivo y acción sin pausa.",
  },
  {
    nombre: "Silent Hill 2",
    genero: "Terror",
    etiqueta: "Horror psicológico",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6xsyiSHQPtRwEOmuq0xi3AxRKIvvklqCjpslCUB4N8Y83ITj7hVEA_go&s=10",
    descripcion: "Atmósfera inquietante, narrativa profunda y un terror que se queda contigo.",
  },
  {
    nombre: "Persona 5",
    genero: "RPG",
    etiqueta: "RPG japonés",
    imagen: "https://m.media-amazon.com/images/M/MV5BNWRmYzE4NzAtY2Q5My00Mjc1LWJhNDgtMmRmNGQzMzMyYTJkXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    descripcion: "Historia envolvente, personajes memorables y un sistema de combate estratégico.",
  },
];

export function buscarJuegoEnCatalogo(nombre) {
  const nombreNormalizado = nombre
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();

  if (!nombreNormalizado) return null;

  return catalogoJuegos.find((juego) => {
    const nombreCatalogo = juego.nombre
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase();
    return nombreCatalogo === nombreNormalizado;
  }) || null;
}

export default catalogoJuegos;
