import type { NextFunction, Request, Response } from "express";
import {
  InvalidReportSectionsError,
  ReportCaseNotFoundError,
  type ReportPdfService,
} from "./report-pdf.service";

export class ReportPdfController {
  constructor(private readonly reportPdfService: ReportPdfService) {}

  download = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const caseId =
        typeof req.params.caseId === "string" ? req.params.caseId : "";
      if (req.body?.confirmado !== true) {
        res.status(400).json({
          error: "Confirma que revisaste la información antes de descargar.",
        });
        return;
      }
      const report = await this.reportPdfService.generate(
        req.session.userId ?? "",
        caseId,
        req.body?.secciones,
      );
      res
        .status(200)
        .set({
          "Cache-Control": "no-store",
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${report.filename}"`,
        })
        .send(report.buffer);
    } catch (error) {
      if (error instanceof ReportCaseNotFoundError) {
        res.status(404).json({ error: "Caso no encontrado." });
        return;
      }
      if (error instanceof InvalidReportSectionsError) {
        res.status(400).json({
          error: "La selección de secciones no es válida.",
        });
        return;
      }
      next(error);
    }
  };
}
