import type { NextFunction, Request, Response } from "express";
import { statusLabels, urgencyLabels } from "./cases.model";
import type { CasesService } from "./cases.service";

export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  list = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const listing = await this.casesService.listWithFilters({
        status: typeof req.query.estado === "string" ? req.query.estado : "",
        program:
          typeof req.query.programa === "string" ? req.query.programa : "",
        search: typeof req.query.buscar === "string" ? req.query.buscar : "",
      });
      res.render("cases/list", {
        title: "Casos de estudiantes",
        ...listing,
        statusLabels,
        urgencyLabels,
      });
    } catch (error) {
      next(error);
    }
  };

  detail = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = typeof req.params.id === "string" ? req.params.id : "";
      const studentCase = await this.casesService.getById(id);
      if (!studentCase) {
        res
          .status(404)
          .render("errors/not-found", { title: "Caso no encontrado" });
        return;
      }
      res.render("cases/detail", {
        title: studentCase.studentName,
        studentCase,
        statusLabels,
        urgencyLabels,
      });
    } catch (error) {
      next(error);
    }
  };
}
