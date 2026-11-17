// src/modules/qr/qr.routes.ts
// Rutas del módulo QR del Semestre ENLACE UCC
import { Router, Request, Response } from "express";
import { requireAuth } from "../../middlewares/auth";

export interface SemestreInfo {
  token: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: "ACTIVO" | "CERRADO";
  urlPortal: string;
}

export interface QrStats {
  citasAgendadas: number;
  completadas: number;
  pendientes: number;
  canceladas: number;
  porcentajeVirtual: number;
  porcentajePresencial: number;
  totalEstudiantesAtendidos: number;
  carreraMayorDemanda: string;
}

export const SEMESTRE_ACTUAL: SemestreInfo = {
  token: "2026-2-UCC-ENLACE-SEC",
  nombre: "Semestre 2026-2",
  fechaInicio: "2026-08-01",
  fechaFin: "2026-12-15",
  estado: "ACTIVO",
  urlPortal: "/portal-estudiante",
};

export const QR_ESTADISTICAS_DEMO: QrStats = {
  citasAgendadas: 128,
  completadas: 94,
  pendientes: 26,
  canceladas: 8,
  porcentajeVirtual: 62,
  porcentajePresencial: 38,
  totalEstudiantesAtendidos: 115,
  carreraMayorDemanda: "Psicología (32%)",
};

export function createQrRouter(): Router {
  const router = Router();

  // Vista principal del QR del Semestre
  router.get("/", requireAuth, (req: Request, res: Response) => {
    // Generar URL completa para el portal basada en el host
    const host = req.get("host") || "localhost:3000";
    const protocol = req.protocol || "http";
    const portalUrlCompleta = `${protocol}://${host}/portal-estudiante`;

    res.render("qr/index", {
      title: "QR del semestre – ENLACE UCC",
      semestre: SEMESTRE_ACTUAL,
      stats: QR_ESTADISTICAS_DEMO,
      portalUrl: portalUrlCompleta,
    });
  });

  // API: Estadísticas del semestre y del QR
  router.get("/api/stats", requireAuth, (_req: Request, res: Response) => {
    res.json({
      ok: true,
      semestre: SEMESTRE_ACTUAL,
      stats: QR_ESTADISTICAS_DEMO,
      timestamp: new Date().toISOString(),
    });
  });

  // API: Consulta pública del token para validación
  router.get("/api/token", (_req: Request, res: Response) => {
    res.json({
      ok: true,
      token: SEMESTRE_ACTUAL.token,
      semestre: SEMESTRE_ACTUAL.nombre,
      estado: SEMESTRE_ACTUAL.estado,
    });
  });

  return router;
}

export const qrRouter = createQrRouter();
