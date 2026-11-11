import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/rbac";
import type { CasesController } from "./cases.controller";

export function createCasesRouter(controller: CasesController): Router {
  const router = Router();

  router.use(requireAuth, requireRole("ASESOR"));
  router.get("/", controller.list);
  router.get("/:id", controller.detail);

  return router;
}
