// src/modules/ia/ia.routes.ts – Enrutador del módulo de IA y Analítica Predictiva ENLACE UCC
import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { aiPredictorService } from "../../services/aiPredictor";

export function createIaRouter(): Router {
  const router = Router();

  // Middleware de autenticación para todas las rutas del módulo IA
  router.use(requireAuth);

  /**
   * GET /ia/predicciones (o /predicciones cuando está montado en /ia)
   * Renderiza el panel principal con KPIs, análisis heurístico y lista de alertas
   */
  router.get("/predicciones", (req, res) => {
    const predictions = aiPredictorService.analyzeCases();
    const stats = aiPredictorService.getStats(predictions);

    res.render("ia/predicciones", {
      title: "Predicción IA – Falsos Positivos",
      predictions,
      stats,
    });
  });

  /**
   * POST /ia/predicciones/:caseId/revisar
   * Marca un caso analizado como revisado por el profesional
   */
  router.post("/predicciones/:caseId/revisar", (req, res) => {
    const { caseId } = req.params;
    const success = aiPredictorService.markAsReviewed(caseId);

    if (req.accepts("json")) {
      return res.json({ ok: success, message: "Caso marcado como revisado." });
    }
    return res.redirect("/ia/predicciones");
  });

  /**
   * POST /ia/predicciones/:caseId/sensible
   * Marca un caso analizado como de tratamiento sensible
   */
  router.post("/predicciones/:caseId/sensible", (req, res) => {
    const { caseId } = req.params;
    const success = aiPredictorService.markAsSensitive(caseId);

    if (req.accepts("json")) {
      return res.json({ ok: success, message: "Caso marcado como sensible." });
    }
    return res.redirect("/ia/predicciones");
  });

  /**
   * GET /ia (redirección canónica a predicciones)
   */
  router.get("/", (_req, res) => {
    res.redirect("/ia/predicciones");
  });

  return router;
}
