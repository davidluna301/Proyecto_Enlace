import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/rbac";
import { auditCaseCreation } from "../../middlewares/audit";
import type { CasesController } from "./cases.controller";

export function createCasesRouter(
  controller: CasesController,
  auditDirectory?: string,
): Router {
  const router = Router();

  router.use(requireAuth, requireRole("ASESOR"));
  router.get("/", controller.list);
  router.get("/data", controller.data);
  router.get("/nuevo", controller.showCreate);
  router.post("/", controller.create, auditCaseCreation(auditDirectory));
  router.get("/:id", controller.detail);

  return router;
}
