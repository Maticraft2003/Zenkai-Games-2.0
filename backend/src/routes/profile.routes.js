import { Router } from "express";

export function crearRutasPerfil(controlador, requerirSesion) {
    const router = Router();

    router.get("/:id", requerirSesion, controlador.obtenerPerfil);
    router.patch("/:id", requerirSesion, controlador.actualizarPerfil);

    return router;
}