import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/rbac";
import type { ReportSelectionController } from "./report-selection.controller";

export function createReportSelectionRouter(
  controller: ReportSelectionController,
): Router {
  const router = Router();
  router.use(requireAuth, requireRole("ASESOR"));
  router.get("/nuevo", controller.show);
  router.get("/casos", controller.search);
  router.get("/casos/:caseId", controller.caseDetails);
  return router;
}
