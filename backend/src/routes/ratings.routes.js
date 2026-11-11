import { Router } from "express";

export function crearRutasCalificaciones(controlador, middleware) {
    const router = Router();

    router.get("/juegos/:gameKey", middleware.permitirSesionOpcional, controlador.obtenerCalificacion);
    router.post("/juegos/:gameKey", middleware.requerirSesion, controlador.guardarCalificacion);

    return router;
}