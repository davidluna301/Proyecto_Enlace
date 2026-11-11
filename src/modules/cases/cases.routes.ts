import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/rbac";
import { auditCaseCreation } from "../../middlewares/audit";
import type { CasesController } from "./cases.controller";

export function createCasesRouter(controller: CasesController): Router {
  const router = Router();

  router.use(requireAuth, requireRole("ASESOR"));
  router.get("/", controller.list);
  router.get("/nuevo", controller.showCreate);
  router.post("/", controller.create, auditCaseCreation);
  router.get("/:id", controller.detail);

  return router;
}
