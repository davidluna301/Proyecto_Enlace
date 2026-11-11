import type { NextFunction, Request, Response } from "express";
import { statusLabels, urgencyLabels } from "./cases.model";
import { GRUPOS_MARCADORES } from "../../data/marcadores";
import { PROGRAMAS } from "../../data/programas";
import {
  DuplicateEmailError,
  validateCase,
  type CaseFormErrors,
  type CaseFormValues,
  type CasesService,
} from "./cases.service";

export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  private query(req: Request) {
    const text = (value: unknown) => (typeof value === "string" ? value : "");
    return {
      status: text(req.query.estado),
      program: text(req.query.carrera || req.query.programa),
      search: text(req.query.q || req.query.buscar),
    };
  }

  list = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const listing = await this.casesService.listWithFilters(this.query(req));
      const created = req.session.caseCreated;
      delete req.session.caseCreated;
      res.render("cases/list", {
        title: "Casos de estudiantes",
        ...listing,
        statusLabels,
        urgencyLabels,
        created,
      });
    } catch (error) {
      next(error);
    }
  };

  data = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { cases } = await this.casesService.listWithFilters(
        this.query(req),
      );
      res
        .set("Cache-Control", "no-store")
        .json({ items: cases, total: cases.length });
    } catch (error) {
      next(error);
    }
  };

  private renderForm(
    res: Response,
    values: CaseFormValues,
    errors: CaseFormErrors,
  ): void {
    res.render("cases/new", {
      title: "Nuevo caso",
      values,
      errors,
      programs: PROGRAMAS,
      groups: GRUPOS_MARCADORES,
    });
  }

  showCreate = (_req: Request, res: Response): void => {
    this.renderForm(
      res,
      { studentName: "", email: "", program: "", summary: "", markers: [] },
      {},
    );
  };

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const field = (name: string): string =>
      typeof req.body[name] === "string" ? req.body[name] : "";
    const markers = Array.isArray(req.body.markers)
      ? req.body.markers.filter(
          (value: unknown): value is string => typeof value === "string",
        )
      : typeof req.body.markers === "string"
        ? [req.body.markers]
        : [];
    const values: CaseFormValues = {
      studentName: field("studentName"),
      email: field("email"),
      program: field("program"),
      summary: field("summary"),
      markers,
    };
    const errors = validateCase(values);
    if (Object.keys(errors).length) {
      res.status(422);
      this.renderForm(res, values, errors);
      return;
    }
    try {
      const created = await this.casesService.create(values);
      res.locals.createdCaseId = created.id;
      next();
    } catch (error) {
      if (error instanceof DuplicateEmailError) {
        res.status(422);
        this.renderForm(res, values, {
          email: "Ya existe un caso con este correo institucional.",
        });
        return;
      }
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
        groups: GRUPOS_MARCADORES.map((group) => ({
          ...group,
          marcadores: group.marcadores.filter((marker) =>
            studentCase.markers?.includes(marker.id),
          ),
        })).filter((group) => group.marcadores.length),
      });
    } catch (error) {
      next(error);
    }
  };
}
