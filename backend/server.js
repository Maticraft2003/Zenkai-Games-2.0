import db from "./database.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Backend de Zenkai Games funcionando");
});

const PORT = process.env.PORT || 3001;
app.post("/login", (req, res) => {

    const { email, password } = req.body;

    db.get(
        "SELECT * FROM usuarios WHERE email = ? AND password = ?",
        [email, password],
        (err, usuario) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    mensaje: "Error del servidor"
                });
            }

            if (!usuario) {
                return res.json({
                    success: false,
                    mensaje: "Correo o contraseña incorrectos"
                });
            }

            return res.json({
                success: true,
                mensaje: "Bienvenido",
                usuario: {
                id: usuario.id,
                email: usuario.email
              }
         });

        }
    );

});
app.post("/register", (req, res) => {

    const { username, email, password } = req.body;

    db.run(

        `
        INSERT INTO usuarios(username, email, password)
        VALUES(?, ?, ?)
        `,

        [username, email, password],

        function(err) {

            if (err) {

                return res.json({

                    success: false,
                    mensaje: "Ese correo ya está registrado."

                });

            }

            return res.json({

                success: true,
                mensaje: "Usuario creado correctamente."

            });

        }

    );

});

// Obtener todos los juegos
app.get("/juegos", (req, res) => {
    db.all("SELECT * FROM juegos ORDER BY id DESC", (err, rows) => {
        if (err){
            return res.status(500).json({
                success: false,
                mensaje: "Error al obtener los juegos",
                error: err.message
            });
        }

        return res.json({
            success: true,
            juegos: rows
        });
    }); 
});

// Obtener un juego por ID
app.get("/juegos/:id", (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM juegos WHERE id = ?", [id], (err, juegos) => {
        if (err){
            return res.status(500).json({
                success: false,
                mensaje: "Error al buscar el juego",
                error: err.message
            });
        }

        if (!juegos) {
            return res.status(404).json({
                success: false,
                mensaje: "Juego no encontrado"
          });
        }

        return res.json({
            success: true,
            juego: juegos
        });
    });
});

// Crear un juego nuevo
app.post("/juegos", (req, res) => {
    const { nombre, genero, puntuacion, plataforma, imagen, descripcion } = req.body;

    db.run(
        `
        INSERT INTO juegos(nombre, genero, puntuacion, plataforma, imagen, descripcion)
        VALUES(?, ?, ?, ?, ?, ?)
        `,
        [nombre, genero, puntuacion, plataforma, imagen, descripcion],
        function (err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    mensaje: "Error al crear el juego",
                    error: err.message
                });
            }

            return res.status(201).json({
                success: true,
                mensaje: "Juego creado correctamente",
                id: this.lastID
            });
        }
    );
});

// Editar un juego
app.put("/juegos/:id", (req, res) => {
    const { id } = req.params;
    const { nombre, genero, puntuacion, plataforma, imagen, descripcion } = req.body;

    db.run(
        `
        UPDATE juegos
        SET nombre = ?, genero = ?, puntuacion = ?, plataforma = ?, imagen = ?, descripcion = ?
        WHERE id = ?
        `,
        [nombre, genero, puntuacion, plataforma, imagen, descripcion, id],
        function (err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    mensaje: "Error al actualizar el juego",
                    error: err.message
                });
            }

            return res.json({
                success: true,
                mensaje: "Juego actualizado correctamente",
                cambios: this.changes
            });
        }
    );
});

// Eliminar un juego
app.delete("/juegos/:id", (req, res) => {
    const { id } = req.params;

    db.run("DELETE FROM juegos WHERE id = ?", [id], function (err) {
        if (err) {
            return res.status(500).json({
                success: false,
                mensaje: "Error al eliminar el juego",
                error: err.message
            });
        }

        return res.json({
            success: true,
            mensaje: "Juego eliminado correctamente",
            cambios: this.changes
        });
    });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});