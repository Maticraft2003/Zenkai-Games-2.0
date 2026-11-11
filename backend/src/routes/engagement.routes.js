import { Router } from "express";

export function crearRutasEngagement(controlador, middleware) {
    const router = Router();

    router.get("/juegos/recomendados", controlador.obtenerRecomendados);
    router.get("/juegos/rankings", controlador.obtenerRankings);
    router.get("/juegos/:gameKey", middleware.permitirSesionOpcional, controlador.obtenerEstadisticasJuego);
    router.post("/juegos/:gameKey/visita", middleware.permitirSesionOpcional, controlador.registrarVisita);
    router.post("/juegos/:gameKey/like", middleware.requerirSesion, controlador.darLike);
    router.delete("/juegos/:gameKey/like", middleware.requerirSesion, controlador.quitarLike);
    router.post("/juegos/:gameKey/dislike", middleware.requerirSesion, controlador.darDislike);
    router.delete("/juegos/:gameKey/dislike", middleware.requerirSesion, controlador.quitarDislike);

    return router;
}