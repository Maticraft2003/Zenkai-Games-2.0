import { normalizarClaveJuego } from "../../gameKeys.js";

export function crearControladorFavoritos({ db }) {
    const listarFavoritos = (req, res) => {
        const usuarioId = req.usuarioId;
        if (Number(req.params.usuarioId) !== usuarioId) {
            return res.status(403).json({ success: false, mensaje: "No podés acceder a favoritos de otra cuenta." });
        }

        db.all(
            `SELECT juego_key, nombre, genero, imagen, descripcion
             FROM favoritos
             WHERE usuario_id = ?
             ORDER BY id DESC`,
            [usuarioId],
            (err, favoritos) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        mensaje: "No se pudieron obtener los juegos favoritos."
                    });
                }

                return res.json({ success: true, favoritos });
            }
        );
    };

    const agregarFavorito = (req, res) => {
        const usuarioId = req.usuarioId;
        if (Number(req.params.usuarioId) !== usuarioId) {
            return res.status(403).json({ success: false, mensaje: "No podés modificar favoritos de otra cuenta." });
        }
        const juego = req.body?.juego;
        const nombre = typeof juego?.nombre === "string" ? juego.nombre.trim() : "";
        const genero = typeof juego?.genero === "string" ? juego.genero.trim() : "";
        const imagen = typeof juego?.imagen === "string" ? juego.imagen.trim() : "";
        const descripcion = typeof juego?.descripcion === "string" ? juego.descripcion.trim() : "";
        const juegoKey = normalizarClaveJuego(nombre);

        if (!nombre) {
            return res.status(400).json({
                success: false,
                mensaje: "El juego seleccionado no tiene un nombre válido."
            });
        }

        db.get("SELECT id FROM usuarios WHERE id = ?", [usuarioId], (userError, usuario) => {
            if (userError) {
                return res.status(500).json({
                    success: false,
                    mensaje: "No se pudo verificar la cuenta."
                });
            }

            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    mensaje: "No se encontró la cuenta."
                });
            }

            db.run(
                `INSERT INTO favoritos(usuario_id, juego_key, nombre, genero, imagen, descripcion)
                 VALUES(?, ?, ?, ?, ?, ?)
                 ON CONFLICT(usuario_id, juego_key) DO UPDATE SET
                    nombre = excluded.nombre,
                    genero = excluded.genero,
                    imagen = excluded.imagen,
                    descripcion = excluded.descripcion`,
                [usuarioId, juegoKey, nombre, genero, imagen, descripcion],
                (err) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            mensaje: "No se pudo guardar el juego en favoritos."
                        });
                    }

                    return res.status(201).json({ success: true, mensaje: "Juego agregado a favoritos." });
                }
            );
        });
    };

    const quitarFavorito = (req, res) => {
        const { juegoKey } = req.params;
        const usuarioId = req.usuarioId;
        if (Number(req.params.usuarioId) !== usuarioId) {
            return res.status(403).json({ success: false, mensaje: "No podés modificar favoritos de otra cuenta." });
        }

        db.run(
            "DELETE FROM favoritos WHERE usuario_id = ? AND juego_key = ?",
            [usuarioId, juegoKey],
            function (err) {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        mensaje: "No se pudo quitar el juego de favoritos."
                    });
                }

                return res.json({
                    success: true,
                    mensaje: "Juego quitado de favoritos.",
                    cambios: this.changes
                });
            }
        );
    };

    return { listarFavoritos, agregarFavorito, quitarFavorito };
}