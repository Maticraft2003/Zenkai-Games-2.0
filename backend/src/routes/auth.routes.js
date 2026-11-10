import { Router } from "express";

export function createAuthRoutes(authController) {
    const router = Router();

    router.post("/login", authController.login);
    router.post("/register", authController.register);

    return router;
}