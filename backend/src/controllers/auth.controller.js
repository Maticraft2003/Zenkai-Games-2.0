export function createAuthController({ db, bcrypt, crearSesion }) {
    const login = (req, res) => {
        const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
        const password = typeof req.body?.password === "string" ? req.body.password : "";

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                mensaje: "Ingresá el correo y la contraseña."
            });
        }

        db.get(
            `SELECT usuarios.id, usuarios.username, usuarios.email, usuarios.password,
                    COALESCE(user_roles.role, 'usuario') AS role
             FROM usuarios
             LEFT JOIN user_roles ON user_roles.user_id = usuarios.id
             WHERE usuarios.email = ?`,
            [email],
            async (err, usuario) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        mensaje: "Error del servidor"
                    });
                }

                let contrasenaValida = false;
                if (usuario) {
                    try {
                        contrasenaValida = await bcrypt.compare(password, usuario.password);
                    } catch (compareError) {
                        console.error("No se pudo verificar la contraseña:", compareError);
                        return res.status(500).json({
                            success: false,
                            mensaje: "Error del servidor"
                        });
                    }
                }

                if (!usuario || !contrasenaValida) {
                    return res.json({
                        success: false,
                        mensaje: "Correo o contraseña incorrectos"
                    });
                }

                crearSesion(usuario.id, (sessionError, token) => {
                    if (sessionError) {
                        console.error("No se pudo crear la sesión del usuario:", sessionError);
                        return res.status(500).json({
                            success: false,
                            mensaje: "No se pudo iniciar la sesión.",
                        });
                    }

                    db.run("DELETE FROM auth_sessions WHERE expires_at <= ?", [new Date().toISOString()]);
                    return res.json({
                        success: true,
                        mensaje: "Bienvenido",
                        usuario: {
                            id: usuario.id,
                            username: usuario.username,
                            email: usuario.email,
                            role: usuario.role,
                            token,
                        },
                    });
                });
            }
        );
    };

    const register = (req, res) => {
        const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
        const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
        const password = typeof req.body?.password === "string" ? req.body.password : "";

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                mensaje: "Completá el nombre, el correo y la contraseña."
            });
        }

        if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
            return res.status(400).json({
                success: false,
                mensaje: "La contraseña debe tener al menos 8 caracteres y no superar los 72 bytes."
            });
        }

        bcrypt.hash(password, 12, (hashError, hashedPassword) => {
            if (hashError) {
                console.error("No se pudo proteger la contraseña:", hashError);
                return res.status(500).json({
                    success: false,
                    mensaje: "No se pudo crear la cuenta."
                });
            }

            db.run(
                `INSERT INTO usuarios(username, email, password)
                 VALUES(?, ?, ?)`,
                [username, email, hashedPassword],
                function (err) {
                    if (err) {
                        if (err.code === "SQLITE_CONSTRAINT") {
                            return res.status(409).json({
                                success: false,
                                mensaje: "Ese correo ya está registrado."
                            });
                        }

                        return res.status(500).json({
                            success: false,
                            mensaje: "No se pudo crear la cuenta."
                        });
                    }

                    const userId = this.lastID;
                    db.run("INSERT INTO user_roles(user_id, role) VALUES(?, 'usuario')", [userId], (roleError) => {
                        if (roleError) {
                            console.error("No se pudo asignar el rol inicial a la cuenta:", roleError);
                            return res.status(500).json({
                                success: false,
                                mensaje: "La cuenta se creó, pero no se pudo terminar su configuración."
                            });
                        }

                        return res.status(201).json({
                            success: true,
                            mensaje: "Usuario creado correctamente.",
                            usuario: { id: userId, username, email, role: "usuario" }
                        });
                    });
                }
            );
        });
    };

    return { login, register };
}