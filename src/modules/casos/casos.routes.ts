// src/modules/casos/casos.routes.ts – Módulo de Marcadores Críticos ENLACE UCC
import { Router, type Request, type Response } from "express";
import { requireAuth } from "../../middlewares/auth";
import { mockCases } from "../../data/cases.mock";
import { mockUsers } from "../../data/users.mock";
import {
  riskEmojis,
  riskLabels,
  type RiskLevel,
} from "../cases/cases.model";

export function createCasosMarcadoresRouter(): Router {
  const router = Router();

  router.use("/casos", requireAuth);

  // ── GET /casos/marcadores – Tablero de Marcadores Críticos de Riesgo ──────
  router.get("/casos/marcadores", (_req: Request, res: Response) => {
    // Mapa rápido de asesores por ID
    const advisorMap = new Map(mockUsers.map((u) => [u.id, u.name]));

    // Lista consolidada de estudiantes con análisis de riesgo
    const estudiantes = mockCases.map((caso, index) => {
      const riskLevel: RiskLevel = caso.riskLevel || (
        caso.urgency === "ALTA"
          ? index % 2 === 0
            ? "CRITICO"
            : "ALTO"
          : caso.urgency === "MEDIA"
            ? "MODERADO"
            : "BAJO"
      );

      const semester = caso.semester || `${(index % 8) + 1}° Semestre`;
      const advisorName = advisorMap.get(caso.advisorId) || "Sin asignar";

      return {
        id: caso.id,
        studentName: caso.studentName,
        program: caso.program,
        semester,
        riskLevel,
        riskEmoji: riskEmojis[riskLevel] || "😐",
        riskLabel: riskLabels[riskLevel] || "Moderado",
        riskDescription:
          caso.riskDescription ||
          caso.summary ||
          "Seguimiento por factores de permanencia académica.",
        advisorId: caso.advisorId,
        advisorName,
        status: caso.status,
        lastMovement: caso.lastMovement,
      };
    });

    // Contadores para el resumen superior
    const summary = {
      total: estudiantes.length,
      bajo: estudiantes.filter((e) => e.riskLevel === "BAJO").length,
      moderado: estudiantes.filter((e) => e.riskLevel === "MODERADO").length,
      medioAlto: estudiantes.filter((e) => e.riskLevel === "MEDIO_ALTO").length,
      alto: estudiantes.filter((e) => e.riskLevel === "ALTO").length,
      critico: estudiantes.filter((e) => e.riskLevel === "CRITICO").length,
    };

    // Asesores únicos para el select de filtros
    const asesoresDisponibles = Array.from(
      new Set(estudiantes.map((e) => e.advisorName)),
    ).sort();

    // Semestres únicos para el select de filtros
    const semestresDisponibles = Array.from(
      new Set(estudiantes.map((e) => e.semester)),
    ).sort((a, b) => {
      const numA = parseInt(a, 10) || 0;
      const numB = parseInt(b, 10) || 0;
      return numA - numB;
    });

    res.render("casos/marcadores", {
      title: "Marcadores Críticos de Riesgo",
      estudiantes,
      summary,
      asesoresDisponibles,
      semestresDisponibles,
      riskEmojis,
      riskLabels,
    });
  });

  return router;
}
