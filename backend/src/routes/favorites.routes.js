import { Router } from "express";

export function crearRutasFavoritos(controlador, requerirSesion) {
    const router = Router();

    router.get("/usuarios/:usuarioId/favoritos", requerirSesion, controlador.listarFavoritos);
    router.post("/usuarios/:usuarioId/favoritos", requerirSesion, controlador.agregarFavorito);
    router.delete("/usuarios/:usuarioId/favoritos/:juegoKey", requerirSesion, controlador.quitarFavorito);

    return router;
}