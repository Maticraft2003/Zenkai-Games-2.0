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
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});