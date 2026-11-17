// src/services/pdfReportGenerator.ts – Generador de reportes PDF protegidos con PDFKit para ENLACE UCC
import PDFDocument from "pdfkit";
import { existsSync } from "node:fs";
import path from "node:path";
import { mockCases } from "../data/cases.mock";
import { MARCADORES } from "../data/marcadores";
import { statusLabels, urgencyLabels, type StudentCase } from "../modules/cases/cases.model";

export interface PDFReportFilters {
  semestre?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  asesor?: string;
  estado?: string;
  urgencia?: string;
  incluirDatosPersonales?: boolean;
  incluirDiagnostico?: boolean;
  incluirNotasPrivadas?: boolean;
  incluirHistorial?: boolean;
  marcaAguaSegura?: boolean;
}

export interface PDFReportResult {
  buffer: Buffer;
  filename: string;
  totalCases: number;
}

export class PDFReportGenerator {
  /**
   * Filtra los casos según los criterios seleccionados
   */
  public filterCases(filters: PDFReportFilters, cases: StudentCase[] = mockCases): StudentCase[] {
    return cases.filter((c) => {
      // Filtro por asesor
      if (filters.asesor && filters.asesor !== "TODOS") {
        if (c.advisorId !== filters.asesor && !filters.asesor.includes(c.advisorId)) {
          // Chequear si el filtro es por nombre de asesor
          const advisorMatches = (c.advisorId === "usr-asesor-01" && filters.asesor.includes("María"));
          if (!advisorMatches) return false;
        }
      }

      // Filtro por estado
      if (filters.estado && filters.estado !== "TODOS") {
        if (c.status !== filters.estado) return false;
      }

      // Filtro por urgencia
      if (filters.urgencia && filters.urgencia !== "TODAS") {
        if (c.urgency !== filters.urgencia) return false;
      }

      // Filtro por rango de fechas (basado en lastMovement o eventos)
      const caseDate = c.events[0]?.date ? new Date(c.events[0].date) : new Date(c.lastMovement);
      if (filters.fechaDesde) {
        const fromDate = new Date(filters.fechaDesde);
        if (!isNaN(fromDate.getTime()) && caseDate < fromDate) return false;
      }
      if (filters.fechaHasta) {
        const toDate = new Date(filters.fechaHasta);
        // Ajustar al final del día
        toDate.setHours(23, 59, 59, 999);
        if (!isNaN(toDate.getTime()) && caseDate > toDate) return false;
      }

      return true;
    });
  }

  /**
   * Genera el documento PDF protegido con PDFKit
   */
  public async generatePdf(filters: PDFReportFilters): Promise<PDFReportResult> {
    const matchingCases = this.filterCases(filters);
    const generatedAt = new Date();
    const formattedDate = new Intl.DateTimeFormat("es-CO", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "America/Bogota",
    }).format(generatedAt);

    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 45, bottom: 45, left: 45, right: 45 },
      bufferPages: true,
      info: {
        Title: "Reporte Institucional de Acompañamiento - ENLACE UCC",
        Author: "Plataforma ENLACE - Universidad Cooperativa de Colombia",
        Subject: `Reporte de Casos Semestre ${filters.semestre || "2026-2"}`,
        Keywords: "ENLACE, UCC, Acompañamiento, Reporte, Confidencial",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    const logoPath = path.resolve(__dirname, "../public/img/logolink.png");
    const hasLogo = existsSync(logoPath);

    // ── Encabezado Institucional ──
    doc.rect(45, 45, doc.page.width - 90, 75).fillAndStroke("#f8fafc", "#e2e8f0");

    if (hasLogo) {
      try {
        doc.image(logoPath, 55, 55, { fit: [95, 55] });
      } catch {
        // En caso de fallo de renderizado de imagen, continuar sin romper
      }
    }

    const headerLeft = hasLogo ? 165 : 60;
    doc
      .fillColor("#0e6577")
      .font("Helvetica-Bold")
      .fontSize(15)
      .text("UNIVERSIDAD COOPERATIVA DE COLOMBIA", headerLeft, 55);

    doc
      .fillColor("#189fba")
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("SISTEMA ENLACE · Acompañamiento Estudiantil Integral", headerLeft, 73);

    doc
      .fillColor("#64748b")
      .font("Helvetica")
      .fontSize(8.5)
      .text(`Generado el: ${formattedDate} · Semestre Académico: ${filters.semestre || "2026-2"}`, headerLeft, 90)
      .text("Documento oficial para uso exclusivo de comités de permanencia y bienestar.", headerLeft, 102);

    doc.moveDown(2);

    // ── Barra de Seguridad y Habeas Data ──
    const bannerTop = 130;
    doc.rect(45, bannerTop, doc.page.width - 90, 24).fillAndStroke("#eff6ff", "#bfdbfe");
    doc
      .fillColor("#1d4ed8")
      .font("Helvetica-Bold")
      .fontSize(8.5)
      .text("🔒 DOCUMENTO INSTITUCIONAL PROTEGIDO · CUMPLIMIENTO LEY 1581 DE 2012 (HABEAS DATA)", 55, bannerTop + 7);

    // ── Resumen de Filtros Aplicados ──
    const filterBoxTop = 162;
    doc.rect(45, filterBoxTop, doc.page.width - 90, 68).fillAndStroke("#ffffff", "#e2e8f0");
    
    doc
      .fillColor("#1e293b")
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .text("PARÁMETROS DEL REPORTE:", 55, filterBoxTop + 8);

    doc.font("Helvetica").fontSize(8.5).fillColor("#334155");
    
    const col1 = 55;
    const col2 = 230;
    const col3 = 410;

    doc.text(`• Semestre: ${filters.semestre || "2026-2"}`, col1, filterBoxTop + 24);
    doc.text(`• Rango: ${filters.fechaDesde || "Inicio"} hasta ${filters.fechaHasta || "Fin"}`, col1, filterBoxTop + 38);
    doc.text(`• Total casos incluidos: ${matchingCases.length}`, col1, filterBoxTop + 52);

    const asesorLabel = filters.asesor === "TODOS" || !filters.asesor ? "Todos los asesores" : "Asesor Asignado";
    const estadoLabel = filters.estado === "TODOS" || !filters.estado ? "Todos los estados" : (statusLabels[filters.estado as keyof typeof statusLabels] || filters.estado);
    doc.text(`• Asesor: ${asesorLabel}`, col2, filterBoxTop + 24);
    doc.text(`• Estado: ${estadoLabel}`, col2, filterBoxTop + 38);
    doc.text(`• Urgencia: ${filters.urgencia || "Todas"}`, col2, filterBoxTop + 52);

    doc.text(`• Datos personales: ${filters.incluirDatosPersonales ? "INCLUIDOS" : "PROTEGIDOS"}`, col3, filterBoxTop + 24);
    doc.text(`• Diagnóstico: ${filters.incluirDiagnostico ? "INCLUIDO" : "EXCLUIDO"}`, col3, filterBoxTop + 38);
    doc.text(`• Notas privadas: ${filters.incluirNotasPrivadas ? "INCLUIDAS" : "EXCLUIDAS"}`, col3, filterBoxTop + 52);

    doc.y = filterBoxTop + 80;

    // ── Listado de Casos ──
    if (matchingCases.length === 0) {
      doc
        .moveDown(2)
        .font("Helvetica-Oblique")
        .fontSize(11)
        .fillColor("#64748b")
        .text("No se encontraron casos que cumplan con los criterios de filtro seleccionados.", {
          align: "center",
        });
    } else {
      matchingCases.forEach((studentCase, index) => {
        // Verificar si se necesita un salto de página
        if (doc.y > doc.page.height - 180) {
          doc.addPage();
        }

        const startY = doc.y + 10;
        doc.rect(45, startY, doc.page.width - 90, 1).fill("#cbd5e1");
        doc.moveDown(0.8);

        // Cabecera del caso
        const caseHeaderY = doc.y;
        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .fillColor("#0e6577")
          .text(`Caso #${index + 1}: ${studentCase.id}`, 45, caseHeaderY);

        const urgencyLabel = urgencyLabels[studentCase.urgency] || studentCase.urgency;
        const statusLabel = statusLabels[studentCase.status] || studentCase.status;
        doc
          .font("Helvetica-Bold")
          .fontSize(9)
          .fillColor(studentCase.urgency === "ALTA" ? "#dc2626" : "#2563eb")
          .text(`[Urgencia: ${urgencyLabel}]   [Estado: ${statusLabel}]`, 320, caseHeaderY, { align: "right", width: doc.page.width - 365 });

        doc.moveDown(0.4);

        // Bloque 1: Datos del estudiante
        if (filters.incluirDatosPersonales) {
          doc
            .font("Helvetica-Bold")
            .fontSize(9)
            .fillColor("#1e293b")
            .text("Estudiante: ", { continued: true })
            .font("Helvetica")
            .text(`${studentCase.studentName}   |   Programa: ${studentCase.program}`);

          const emailText = studentCase.tieneCorreoInstitucional && studentCase.email
            ? studentCase.email
            : (studentCase.contactEmail || "Sin correo institucional registrado");

          doc
            .font("Helvetica-Bold")
            .fontSize(8.5)
            .fillColor("#64748b")
            .text("Correo de contacto: ", { continued: true })
            .font("Helvetica")
            .text(emailText);
        } else {
          doc
            .font("Helvetica-Bold")
            .fontSize(9)
            .fillColor("#475569")
            .text("Estudiante: ", { continued: true })
            .font("Helvetica-Oblique")
            .text("[IDENTIDAD PROTEGIDA - LEY DE HABEAS DATA]   |   Programa: " + studentCase.program);
        }

        // Bloque 2: Diagnóstico y motivo del caso
        if (filters.incluirDiagnostico) {
          doc.moveDown(0.3);
          doc
            .font("Helvetica-Bold")
            .fontSize(9)
            .fillColor("#1e293b")
            .text("Motivo y diagnóstico de acompañamiento:");
          doc
            .font("Helvetica")
            .fontSize(8.5)
            .fillColor("#334155")
            .text(studentCase.summary, { indent: 10, lineGap: 1.5 });

          // Marcadores críticos
          if (studentCase.markers && studentCase.markers.length > 0) {
            const markerNames = MARCADORES
              .filter((m) => studentCase.markers.includes(m.id))
              .map((m) => m.nombre)
              .join(", ");
            doc
              .font("Helvetica-Bold")
              .fontSize(8)
              .fillColor("#dc2626")
              .text(`Marcadores críticos detectados: ${markerNames}`, { indent: 10 });
          }
        }

        // Bloque 3: Notas privadas del asesor
        if (filters.incluirNotasPrivadas) {
          doc.moveDown(0.3);
          doc
            .font("Helvetica-Bold")
            .fontSize(9)
            .fillColor("#b45309")
            .text("Notas privadas del asesor (Confidencial):");
          const obsText = studentCase.observacionesAsesor || "Sin observaciones adicionales registradas.";
          doc
            .font("Helvetica-Oblique")
            .fontSize(8.5)
            .fillColor("#78350f")
            .text(obsText, { indent: 10 });
        }

        // Bloque 4: Historial de eventos
        if (filters.incluirHistorial && studentCase.events && studentCase.events.length > 0) {
          doc.moveDown(0.3);
          doc
            .font("Helvetica-Bold")
            .fontSize(9)
            .fillColor("#1e293b")
            .text("Línea de tiempo / Historial de eventos:");
          studentCase.events.forEach((ev) => {
            const eventDate = new Date(ev.date).toLocaleDateString("es-CO");
            doc
              .font("Helvetica-Bold")
              .fontSize(8)
              .fillColor("#475569")
              .text(`  • ${eventDate} [${ev.type}]: `, { continued: true })
              .font("Helvetica")
              .fillColor("#334155")
              .text(ev.description);
          });
        }

        doc.moveDown(0.8);
      });
    }

    // ── Pie de página y numeración en todas las páginas ──
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(range.start + i);

      // Marca de agua si está solicitada
      if (filters.marcaAguaSegura) {
        doc.save();
        doc
          .fillColor("#94a3b8")
          .fillOpacity(0.06)
          .font("Helvetica-Bold")
          .fontSize(48)
          .rotate(-45, { origin: [doc.page.width / 2, doc.page.height / 2] })
          .text("ENLACE UCC - CONFIDENCIAL", 0, doc.page.height / 2, {
            align: "center",
            width: doc.page.width,
          });
        doc.restore();
      }

      // Línea inferior y texto legal
      doc.rect(45, doc.page.height - 35, doc.page.width - 90, 0.5).fill("#cbd5e1");
      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor("#64748b")
        .text(
          "ENLACE UCC · Universidad Cooperativa de Colombia · Documento Confidencial · Prohibida su divulgación",
          45,
          doc.page.height - 28,
        );

      doc
        .font("Helvetica-Bold")
        .fontSize(7.5)
        .fillColor("#475569")
        .text(`Página ${i + 1} de ${range.count}`, doc.page.width - 150, doc.page.height - 28, {
          align: "right",
          width: 105,
        });
    }

    // Finalizar el documento
    return new Promise<PDFReportResult>((resolve, reject) => {
      doc.once("error", reject);
      doc.once("end", () => {
        const buffer = Buffer.concat(chunks);
        const safeSemestre = (filters.semestre || "2026-2").replace(/[^a-zA-Z0-9-]/g, "");
        const dateStr = generatedAt.toISOString().slice(0, 10).replace(/-/g, "");
        const filename = `reporte-enlace-${safeSemestre}-${dateStr}.pdf`;
        resolve({
          buffer,
          filename,
          totalCases: matchingCases.length,
        });
      });
      doc.end();
    });
  }
}

export const pdfReportGenerator = new PDFReportGenerator();
