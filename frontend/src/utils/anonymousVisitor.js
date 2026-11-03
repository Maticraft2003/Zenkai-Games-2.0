const VISITOR_STORAGE_KEY = "zenkai-anonymous-visitor-id";

export function obtenerIdVisitanteAnonimo() {
  const guardado = window.localStorage.getItem(VISITOR_STORAGE_KEY);
  if (guardado && /^[A-Za-z0-9._:-]{8,128}$/.test(guardado)) return guardado;

  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("Este navegador no permite identificar visitas anónimas de forma segura.");
  }

  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  const visitanteId = `anon-${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
  window.localStorage.setItem(VISITOR_STORAGE_KEY, visitanteId);
  return visitanteId;
}
