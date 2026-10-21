export function normalizarClaveJuego(nombre) {
  return nombre
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
}

export function coincideBusquedaJuego(juego, consulta) {
  const consultaNormalizada = normalizarClaveJuego(consulta.trim());
  if (!consultaNormalizada) return true;

  return [juego?.nombre, juego?.genero, juego?.descripcion]
    .filter((valor) => typeof valor === "string")
    .some((valor) => normalizarClaveJuego(valor).includes(consultaNormalizada));
}
