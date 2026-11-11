import { Router } from "express";

export function crearRutasJuegos(controlador, requerirAdministrador) {
    const router = Router();

    router.get("/catalogo-juegos/buscar", requerirAdministrador, controlador.buscarEnCatalogoExterno);
    router.get("/juegos", controlador.listarJuegos);
    router.get("/catalogo-juegos/ocultos", controlador.listarCatalogoOculto);
    router.delete("/catalogo-juegos/:juegoKey", requerirAdministrador, controlador.ocultarJuegoCatalogo);
    router.get("/juegos/:id", controlador.obtenerJuego);
    router.post("/juegos", requerirAdministrador, controlador.crearJuego);
    router.put("/juegos/:id", requerirAdministrador, controlador.actualizarJuego);
    router.delete("/juegos/:id", requerirAdministrador, controlador.eliminarJuego);

    return router;
}