import { Router } from "express";
import type { AuthController } from "./auth.controller";
import { requireAuth } from "../../middlewares/auth";

export function createAuthRouter(controller: AuthController): Router {
  const router = Router();

  router.get("/login", controller.showLogin);
  router.post("/login", controller.login);
  router.post("/logout", requireAuth, controller.logout);

  return router;
}
