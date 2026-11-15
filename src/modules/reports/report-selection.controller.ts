import type { NextFunction, Request, Response } from "express";
import {
  statusIcons,
  statusLabels,
  urgencyLabels,
  type StudentCase,
} from "../cases/cases.model";
import type { CasesService } from "../cases/cases.service";

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
}
