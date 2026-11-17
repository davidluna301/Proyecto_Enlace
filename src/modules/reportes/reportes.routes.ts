// src/modules/reportes/reportes.routes.ts – Enrutador del módulo de Reportes PDF ENLACE UCC
import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { pdfReportGenerator, type PDFReportFilters } from "../../services/pdfReportGenerator";
import { mockCases } from "../../data/cases.mock";

export function createReportesRouter(): Router {
  const router = Router();

  // Middleware de autenticación para todas las rutas de reportes
  router.use(requireAuth);

  /**
   * GET /reportes/pdf
   * Renderiza el panel de configuración de filtros y preview del reporte PDF
   */
  router.get("/pdf", (req, res) => {
    const semestres = [
      { id: "2026-2", name: "2026-2 (Semestre actual)" },
      { id: "2026-1", name: "2026-1" },
      { id: "2025-2", name: "2025-2" },
      { id: "TODOS", name: "Todos los semestres" },
    ];

    const asesores = [
      { id: "TODOS", name: "Todos los asesores" },
      { id: "usr-asesor-01", name: "María Fernanda Ríos" },
      { id: "Jhon Álvarez", name: "Jhon Álvarez" },
      { id: "Patricia Morales", name: "Patricia Morales" },
      { id: "Carlos Restrepo", name: "Carlos Restrepo" },
    ];

    const estados = [
      { id: "TODOS", name: "Todos los estados" },
      { id: "NUEVO", name: "Nuevo" },
      { id: "EN_SEGUIMIENTO", name: "En seguimiento" },
      { id: "EN_ESPERA", name: "En espera" },
      { id: "CERRADO", name: "Cerrado" },
    ];

    res.render("reportes/pdf", {
      title: "Generar Reporte PDF Institucional",
      semestres,
      asesores,
      estados,
      totalCases: mockCases.length,
      sampleCases: mockCases.slice(0, 5),
    });
  });

  /**
   * POST /reportes/pdf/generar
   * Genera el PDF filtrado con PDFKit y lo envía para descarga o visualización
   */
  router.post("/pdf/generar", async (req, res, next) => {
    try {
      const isChecked = (val: unknown) =>
        val === true || val === "true" || val === "on" || val === "1";

      // Extraer filtros del cuerpo del formulario o JSON
      const filters: PDFReportFilters = {
        semestre: typeof req.body.semestre === "string" ? req.body.semestre : "2026-2",
        fechaDesde: typeof req.body.fechaDesde === "string" ? req.body.fechaDesde : undefined,
        fechaHasta: typeof req.body.fechaHasta === "string" ? req.body.fechaHasta : undefined,
        asesor: typeof req.body.asesor === "string" ? req.body.asesor : "TODOS",
        estado: typeof req.body.estado === "string" ? req.body.estado : "TODOS",
        urgencia: typeof req.body.urgencia === "string" ? req.body.urgencia : "TODAS",
        // Si no viene en el body (ej: petición sin checkboxes), por defecto los campos básicos se incluyen si no se enviaron explícitamente como false
        incluirDatosPersonales: req.body.incluirDatosPersonales !== undefined
          ? isChecked(req.body.incluirDatosPersonales)
          : true,
        incluirDiagnostico: req.body.incluirDiagnostico !== undefined
          ? isChecked(req.body.incluirDiagnostico)
          : true,
        incluirNotasPrivadas: req.body.incluirNotasPrivadas !== undefined
          ? isChecked(req.body.incluirNotasPrivadas)
          : false,
        incluirHistorial: req.body.incluirHistorial !== undefined
          ? isChecked(req.body.incluirHistorial)
          : true,
        marcaAguaSegura: req.body.marcaAguaSegura !== undefined
          ? isChecked(req.body.marcaAguaSegura)
          : true,
      };

      const result = await pdfReportGenerator.generatePdf(filters);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
      res.setHeader("Content-Length", result.buffer.length);
      res.send(result.buffer);
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /reportes (redirección canónica a /reportes/pdf)
   */
  router.get("/", (_req, res) => {
    res.redirect("/reportes/pdf");
  });

  return router;
}
