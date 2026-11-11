export function crearControladorPerfil({ db, bcrypt }) {
    const obtenerPerfil = (req, res) => {
        if (Number(req.params.id) !== req.usuarioId) {
            return res.status(403).json({ success: false, mensaje: "No podés consultar el perfil de otra cuenta." });
        }
        const id = req.usuarioId;

        db.get(
            `SELECT usuarios.id, usuarios.username, usuarios.email,
                    COALESCE(user_roles.role, 'usuario') AS role
             FROM usuarios
             LEFT JOIN user_roles ON user_roles.user_id = usuarios.id
             WHERE usuarios.id = ?`,
            [id],
            (err, usuario) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        mensaje: "No se pudo consultar el perfil."
                    });
                }

                if (!usuario) {
                    return res.status(404).json({
                        success: false,
                        mensaje: "No se encontró la cuenta."
                    });
                }

                return res.json({ success: true, usuario });
            }
        );
    };

    const actualizarPerfil = (req, res) => {
        if (Number(req.params.id) !== req.usuarioId) {
            return res.status(403).json({ success: false, mensaje: "No podés modificar el perfil de otra cuenta." });
        }
        const id = req.usuarioId;
        const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
        const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
        const currentPassword = typeof req.body?.currentPassword === "string" ? req.body.currentPassword : "";
        const newPassword = typeof req.body?.newPassword === "string" ? req.body.newPassword : "";

        if (!username || !email || !currentPassword) {
            return res.status(400).json({
                success: false,
                mensaje: "El nombre, el correo y la contraseña actual son obligatorios."
            });
        }

        if (newPassword && (newPassword.length < 8 || Buffer.byteLength(newPassword, "utf8") > 72)) {
            return res.status(400).json({
                success: false,
                mensaje: "La nueva contraseña debe tener al menos 8 caracteres y no superar los 72 bytes."
            });
        }

        db.get(
            `SELECT usuarios.id, usuarios.username, usuarios.email, usuarios.password,
                    COALESCE(user_roles.role, 'usuario') AS role
             FROM usuarios
             LEFT JOIN user_roles ON user_roles.user_id = usuarios.id
             WHERE usuarios.id = ?`,
            [id],
            async (findError, usuario) => {
                if (findError) {
                    return res.status(500).json({
                        success: false,
                        mensaje: "No se pudo consultar el perfil."
                    });
                }

                if (!usuario) {
                    return res.status(404).json({
                        success: false,
                        mensaje: "No se encontró la cuenta."
                    });
                }

                try {
                    const contrasenaValida = await bcrypt.compare(currentPassword, usuario.password);
                    if (!contrasenaValida) {
                        return res.status(401).json({
                            success: false,
                            mensaje: "La contraseña actual es incorrecta."
                        });
                    }

                    const hashedPassword = newPassword
                        ? await bcrypt.hash(newPassword, 12)
                        : usuario.password;

                    db.run(
                        `UPDATE usuarios
                         SET username = ?, email = ?, password = ?
                         WHERE id = ?`,
                        [username, email, hashedPassword, id],
                        function (updateError) {
                            if (updateError) {
                                if (updateError.code === "SQLITE_CONSTRAINT") {
                                    return res.status(409).json({
                                        success: false,
                                        mensaje: "Ese correo ya está registrado por otra cuenta."
                                    });
                                }

                                return res.status(500).json({
                                    success: false,
                                    mensaje: "No se pudo actualizar el perfil."
                                });
                            }

                            return res.json({
                                success: true,
                                mensaje: "Perfil actualizado correctamente.",
                                usuario: { id: usuario.id, username, email, role: usuario.role }
                            });
                        }
                    );
                } catch (passwordError) {
                    console.error("No se pudo verificar o actualizar la contraseña:", passwordError);
                    return res.status(500).json({
                        success: false,
                        mensaje: "No se pudo actualizar el perfil."
                    });
                }
            }
        );
    };

    return { obtenerPerfil, actualizarPerfil };
}