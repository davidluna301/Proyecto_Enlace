import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import {
  GRUPOS_MARCADORES,
  MARCADORES,
  type CategoriaMarcador,
} from "../../data/marcadores";
import {
  statusLabels,
  urgencyLabels,
  type StudentCase,
} from "../cases/cases.model";
import type { CasesService } from "../cases/cases.service";
import {
  SECCIONES_REPORTE,
  type SeccionReporteId,
} from "./report-sections.constants";
import PDFDocument from "pdfkit";

export class ReportCaseNotFoundError extends Error {}
export class InvalidReportSectionsError extends Error {}

export interface GeneratedReport {
  buffer: Buffer;
  filename: string;
}

const CATEGORY_LABELS = new Map<CategoriaMarcador, string>(
  GRUPOS_MARCADORES.map(({ id, nombre }) => [id, nombre]),
);

function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Bogota",
  }).format(new Date(value));
}

function sectionContent(
  studentCase: StudentCase,
  section: SeccionReporteId,
): { title: string; lines: string[] } {
  switch (section) {
    case "DATOS_ESTUDIANTE":
      return {
        title: "Datos del estudiante",
        lines: [
          `Nombre: ${studentCase.studentName}`,
          studentCase.email
            ? `Correo institucional: ${studentCase.email}`
            : "Sin correo institucional",
          `Carrera: ${studentCase.program}`,
        ],
      };
    case "DESCRIPCION_CASO":
      return {
        title: "Descripción del caso",
        lines: [studentCase.summary],
      };
    case "MARCADORES_CRITICOS": {
      const selectedMarkers = MARCADORES.filter((marker) =>
        studentCase.markers.includes(marker.id),
      );
      return {
        title: "Marcadores críticos",
        lines: selectedMarkers.length
          ? GRUPOS_MARCADORES.flatMap((group) => {
              const markers = selectedMarkers.filter(
                (marker) => marker.categoria === group.id,
              );
              return markers.length
                ? [
                    `${CATEGORY_LABELS.get(group.id) ?? group.nombre}:`,
                    ...markers.map((marker) => `- ${marker.nombre}`),
                  ]
                : [];
            })
          : ["Sin marcadores registrados."],
      };
    }
    case "OBSERVACIONES_ASESOR":
      return {
        title: "Observaciones del asesor",
        lines: [
          studentCase.observacionesAsesor ||
            "No hay observaciones registradas.",
        ],
      };
    case "ESTADO_URGENCIA":
      return {
        title: "Estado y urgencia",
        lines: [
          `Estado: ${statusLabels[studentCase.status]}`,
          `Urgencia: ${urgencyLabels[studentCase.urgency]}`,
        ],
      };
    case "FECHAS_CLAVE":
      return {
        title: "Fechas clave",
        lines: [
          `Creación: ${formatDate(studentCase.events[0]?.date || studentCase.lastMovement)}`,
          `Último movimiento: ${formatDate(studentCase.lastMovement)}`,
        ],
      };
    case "LINEA_TIEMPO":
      return {
        title: "Línea de tiempo",
        lines: studentCase.events.length
          ? studentCase.events.flatMap((event) => [
              `${formatDate(event.date)} - ${event.type}`,
              event.description,
              "",
            ])
          : ["No hay eventos registrados."],
      };
  }
}

function addSection(
  document: PDFKit.PDFDocument,
  title: string,
  lines: string[],
): void {
  document
    .moveDown(0.65)
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#111827")
    .text(title);
  document.moveDown(0.2).font("Helvetica").fontSize(10).fillColor("#222222");
  for (const line of lines) document.text(line, { lineGap: 2 });
}

async function renderPdf(
  studentCase: StudentCase,
  sections: readonly SeccionReporteId[],
  generatedAt: Date,
): Promise<Buffer> {
  const document = new PDFDocument({
    size: "A4",
    margins: { top: 100, bottom: 60, left: 54, right: 54 },
    bufferPages: true,
    compress: false,
    info: {
      Title: "Reporte de acompañamiento ENLACE UCC",
      Author: "ENLACE UCC",
    },
  });
  const chunks: Buffer[] = [];
  const logoPath = path.join(__dirname, "../../public/img/logolink.png");

  document.on("data", (chunk: Buffer) => chunks.push(chunk));

  document.image(logoPath, 54, 35, { fit: [75, 38] });
  document
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor("#111827")
    .text("ENLACE UCC", 145, 38);
  document
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#333333")
    .text(`Reporte de acompañamiento · ${formatDate(generatedAt)}`, 145, 59);

  if (!sections.length) {
    document
      .moveDown(1)
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#222222")
      .text("No se seleccionaron secciones para incluir en este reporte.");
  } else {
    for (const section of sections) {
      const content = sectionContent(studentCase, section);
      addSection(document, content.title, content.lines);
    }
  }

  const pages = document.bufferedPageRange();
  for (let index = 0; index < pages.count; index += 1) {
    document.switchToPage(pages.start + index);
    document
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#333333")
      .text(
        `ENLACE UCC · ${studentCase.id} · Página ${index + 1} de ${pages.count}`,
        54,
        document.page.height - 38,
        { width: document.page.width - 108, align: "center" },
      );
  }

  return new Promise<Buffer>((resolve, reject) => {
    document.once("error", reject);
    document.once("end", () => resolve(Buffer.concat(chunks)));
    document.end();
  });
}

export class ReportPdfService {
  constructor(
    private readonly casesService: CasesService,
    private readonly auditDirectory = path.resolve(process.cwd(), "logs"),
  ) {}

  async generate(
    advisorId: string,
    caseId: string,
    requestedSections: unknown,
  ): Promise<GeneratedReport> {
    if (!advisorId) throw new Error("Se requiere un asesor autenticado.");
    const studentCase = await this.casesService.getByIdForAdvisor(
      caseId,
      advisorId,
    );
    if (!studentCase) throw new ReportCaseNotFoundError();

    const sections = this.validateSections(requestedSections);
    const generatedAt = new Date();
    const buffer = await renderPdf(studentCase, sections, generatedAt);
    const date = generatedAt.toISOString().slice(0, 10).replace(/-/g, "");
    const safeCaseId = studentCase.id.replace(/[^A-Za-z0-9-]/g, "");
    const filename = `reporte-${safeCaseId}-${date}.pdf`;

    await mkdir(this.auditDirectory, { recursive: true });
    await appendFile(
      path.join(this.auditDirectory, "auditoria.jsonl"),
      `${JSON.stringify({
        action: "REPORTE_GENERADO",
        actorId: advisorId,
        caseId: studentCase.id,
        metadata: { sections },
        timestamp: generatedAt.toISOString(),
      })}\n`,
      { encoding: "utf8", mode: 0o600 },
    );

    return { buffer, filename };
  }

  private validateSections(value: unknown): SeccionReporteId[] {
    const validIds = new Set<string>(SECCIONES_REPORTE.map(({ id }) => id));
    if (!Array.isArray(value) || value.length > SECCIONES_REPORTE.length) {
      throw new InvalidReportSectionsError();
    }
    const sections = value.filter(
      (section): section is SeccionReporteId =>
        typeof section === "string" && validIds.has(section),
    );
    if (
      sections.length !== value.length ||
      new Set(sections).size !== sections.length
    ) {
      throw new InvalidReportSectionsError();
    }
    return sections;
  }
}
