import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/rbac";
import type { ReportPdfController } from "./report-pdf.controller";

export function createReportPdfRouter(controller: ReportPdfController): Router {
  const router = Router();
  router.use(requireAuth, requireRole("ASESOR"));
  router.post("/:caseId/pdf", controller.download);
  return router;
}
