export function crearAuthMiddleware({ db, hashToken }) {
    const requerirSesion = (req, res, next) => {
        const authorization = req.get("authorization") || "";
        const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";

        if (!token) {
            return res.status(401).json({
                success: false,
                mensaje: "Iniciá sesión para agregar un juego.",
                code: "AUTH_REQUIRED",
            });
        }

        db.get(
            "SELECT user_id, expires_at FROM auth_sessions WHERE token_hash = ?",
            [hashToken(token)],
            (sessionError, session) => {
                if (sessionError) {
                    return res.status(500).json({
                        success: false,
                        mensaje: "No se pudo verificar tu sesión.",
                    });
                }

                if (!session || Date.parse(session.expires_at) <= Date.now()) {
                    return res.status(401).json({
                        success: false,
                        mensaje: "Tu sesión venció. Iniciá sesión nuevamente.",
                        code: "SESSION_EXPIRED",
                    });
                }

                req.usuarioId = session.user_id;
                return next();
            }
        );
    };

    const permitirSesionOpcional = (req, res, next) => {
        const authorization = req.get("authorization") || "";
        const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";

        if (!token) {
            req.usuarioId = null;
            return next();
        }

        db.get(
            "SELECT user_id, expires_at FROM auth_sessions WHERE token_hash = ?",
            [hashToken(token)],
            (sessionError, session) => {
                if (sessionError) {
                    return res.status(500).json({
                        success: false,
                        mensaje: "No se pudo verificar tu sesión.",
                    });
                }

                if (!session || Date.parse(session.expires_at) <= Date.now()) {
                    return res.status(401).json({
                        success: false,
                        mensaje: "Tu sesión venció. Iniciá sesión nuevamente.",
                        code: "SESSION_EXPIRED",
                    });
                }

                req.usuarioId = session.user_id;
                return next();
            }
        );
    };

    const requerirAdministrador = (req, res, next) => {
        const authorization = req.get("authorization") || "";
        const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";

        if (!token) {
            return res.status(401).json({
                success: false,
                mensaje: "Iniciá sesión como administrador para gestionar juegos.",
                code: "ADMIN_AUTH_REQUIRED",
            });
        }

        db.get(
            `SELECT user_roles.role, auth_sessions.user_id, auth_sessions.expires_at
             FROM auth_sessions
             JOIN user_roles ON user_roles.user_id = auth_sessions.user_id
             WHERE auth_sessions.token_hash = ?`,
            [hashToken(token)],
            (sessionError, session) => {
                if (sessionError) {
                    return res.status(500).json({
                        success: false,
                        mensaje: "No se pudo verificar el permiso de administración.",
                    });
                }

                if (!session || Date.parse(session.expires_at) <= Date.now()) {
                    return res.status(401).json({
                        success: false,
                        mensaje: "Tu sesión venció. Iniciá sesión nuevamente.",
                        code: "SESSION_EXPIRED",
                    });
                }

                if (session.role !== "admin") {
                    return res.status(403).json({
                        success: false,
                        mensaje: "Solo un administrador puede gestionar los juegos.",
                        code: "ADMIN_REQUIRED",
                    });
                }

                req.usuarioAdminId = session.user_id;
                return next();
            }
        );
    };

    return { requerirSesion, permitirSesionOpcional, requerirAdministrador };
}