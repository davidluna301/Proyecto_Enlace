import type { NextFunction, Request, Response } from "express";
import {
  statusIcons,
  statusLabels,
  urgencyLabels,
  type StudentCase,
} from "../cases/cases.model";
import type { CasesService } from "../cases/cases.service";
import { GRUPOS_MARCADORES } from "../../data/marcadores";
import { SECCIONES_REPORTE } from "./report-sections.constants";

function caseSummary(studentCase: StudentCase) {
  return {
    id: studentCase.id,
    studentName: studentCase.studentName,
    program: studentCase.program,
    status: studentCase.status,
    urgency: studentCase.urgency,
    lastMovement: studentCase.lastMovement,
  };
}

export class ReportSelectionController {
  constructor(private readonly casesService: CasesService) {}

  show = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const cases = await this.casesService.list({
        advisorId: req.session.userId,
      });
      res.render("reports/new", {
        title: "Generar reporte",
        cases: cases.slice(0, 10),
        sections: SECCIONES_REPORTE,
        statusLabels,
        statusIcons,
        urgencyLabels,
      });
    } catch (error) {
      next(error);
    }
  };

  search = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
      if (query.length > 100) {
        res.status(400).json({ error: "La búsqueda es demasiado larga." });
        return;
      }
      const cases = await this.casesService.list({
        advisorId: req.session.userId,
        search: query,
      });
      const items = cases.slice(0, 10).map(caseSummary);
      res.set("Cache-Control", "no-store").json({
        items,
        total: items.length,
      });
    } catch (error) {
      next(error);
    }
  };

  caseDetails = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const caseId =
        typeof req.params.caseId === "string" ? req.params.caseId : "";
      const studentCase = await this.casesService.getByIdForAdvisor(
        caseId,
        req.session.userId ?? "",
      );
      if (!studentCase) {
        res.status(404).json({ error: "Caso no encontrado." });
        return;
      }
      res.set("Cache-Control", "no-store").json({
        ...caseSummary(studentCase),
        email: studentCase.email ?? null,
        tieneCorreoInstitucional: studentCase.tieneCorreoInstitucional,
        summary: studentCase.summary,
        observacionesAsesor: studentCase.observacionesAsesor ?? "",
        markers: GRUPOS_MARCADORES.map((group) => ({
          name: group.nombre,
          items: group.marcadores
            .filter((marker) => studentCase.markers.includes(marker.id))
            .map((marker) => marker.nombre),
        })).filter((group) => group.items.length),
        createdAt: studentCase.events[0]?.date || studentCase.lastMovement,
        events: studentCase.events,
      });
    } catch (error) {
      next(error);
    }
  };
}
