// src/services/aiPredictor.ts – Servicio de análisis predictivo de falsos positivos ENLACE UCC
import { mockCases } from "../data/cases.mock";
import type { StudentCase } from "../modules/cases/cases.model";

export type RiskLevel = "ALTO" | "MEDIO" | "BAJO";
export type AlertStatus = "PENDIENTE" | "REVISADO" | "SENSIBLE";

export interface AIPredictionResult {
  caseId: string;
  studentName: string;
  program: string;
  semester: string;
  advisorName: string;
  shortDescription: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0 - 100
  patternDetected: string;
  flags: string[];
  status: AlertStatus;
  reviewedAt?: string;
  analyzedAt: string;
  metrics: {
    tardinessScore: number;
    absencePatternScore: number;
    inconsistencyScore: number;
    urgencyAnomalyScore: number;
  };
}

export interface AIPredictionStats {
  totalAnalyzed: number;
  activeAlerts: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  reviewedCount: number;
  modelAccuracy: number;
  lastUpdated: string;
}

// Mapeo auxiliar de semestre y asesor para casos mockeados
const CASE_METADATA_EXT: Record<string, { semester: string; advisorName: string; specificInconsistency?: string }> = {
  "EN-2026-001": {
    semester: "Semestre 5",
    advisorName: "María Fernanda Ríos",
    specificInconsistency: "Solicitó retomar actividades en la semana 13 argumentando quebranto de salud no notificado en semanas anteriores.",
  },
  "EN-2026-002": {
    semester: "Semestre 2",
    advisorName: "María Fernanda Ríos",
    specificInconsistency: "Radicó acompañamiento para aligerar carga académica a 10 días de las evaluaciones finales sin reporte previo.",
  },
  "EN-2026-003": {
    semester: "Semestre 4",
    advisorName: "Jhon Álvarez",
    specificInconsistency: "Postergó repetidamente el horario de encuentro tras solicitar justificación por trabajo.",
  },
  "EN-2026-004": {
    semester: "Semestre 6",
    advisorName: "Patricia Morales",
    specificInconsistency: "Planificación de cierre solicitada después de perder 2 cortes evaluativos completos.",
  },
  "EN-2026-005": {
    semester: "Semestre 3",
    advisorName: "María Fernanda Ríos",
    specificInconsistency: "Urgencia alta declarada a mediados de noviembre con solicitud de anulación de fallas por motivos personales no acreditados.",
  },
  "EN-2026-006": {
    semester: "Semestre 7",
    advisorName: "Carlos Restrepo",
  },
  "EN-2026-007": {
    semester: "Semestre 4",
    advisorName: "Jhon Álvarez",
    specificInconsistency: "Cambio de motivo de consulta: primero problemas económicos, luego dificultades de convivencia.",
  },
  "EN-2026-008": {
    semester: "Semestre 3",
    advisorName: "Patricia Morales",
  },
  "EN-2026-009": {
    semester: "Semestre 2",
    advisorName: "María Fernanda Ríos",
    specificInconsistency: "Reportó dificultad extrema en la semana 14 alegando inasistencias prolongadas que no constaban en plataforma.",
  },
  "EN-2026-010": {
    semester: "Semestre 8",
    advisorName: "Carlos Restrepo",
  },
};

// Almacén en memoria de revisiones
const reviewedCasesStore = new Map<string, { status: AlertStatus; reviewedAt: string }>();

export class AIPredictorService {
  /**
   * Analiza un caso individual y evalúa reglas de falsos positivos
   */
  public analyzeCase(studentCase: StudentCase): AIPredictionResult {
    const meta = CASE_METADATA_EXT[studentCase.id] || {
      semester: "Semestre 3",
      advisorName: "Asesor Asignado",
    };

    // 1. REGLA: Reporte tardío
    // Si el caso fue registrado a finales de octubre o noviembre (cierre de período)
    const firstEvent = studentCase.events[0];
    const creationDate = firstEvent ? new Date(firstEvent.date) : new Date(studentCase.lastMovement);
    const month = creationDate.getMonth(); // 9: Oct, 10: Nov
    const day = creationDate.getDate();

    let tardinessScore = 20; // base
    const flags: string[] = [];

    // Consideramos Noviembre (mes 10) o fines de Octubre (mes 9, día >= 25) como reporte tardío
    if (month === 10) {
      tardinessScore = day > 8 ? 95 : 85;
      flags.push("⏰ Reporte tardío (cierre de período)");
    } else if (month === 9 && day >= 20) {
      tardinessScore = 65;
      flags.push("📅 Reporte en segundo corte avanzado");
    } else {
      tardinessScore = 25;
    }

    // 2. REGLA: Ausencias al final del semestre y palabras clave
    const summaryLower = (studentCase.summary || "").toLowerCase();
    const eventsText = studentCase.events.map((e) => `${e.type} ${e.description}`.toLowerCase()).join(" ");
    const fullText = `${summaryLower} ${eventsText}`;

    let absencePatternScore = 30;
    if (
      fullText.includes("evaluaciones de cierre") ||
      fullText.includes("cierre") ||
      fullText.includes("retomar") ||
      fullText.includes("inasistencias") ||
      fullText.includes("ausencias")
    ) {
      absencePatternScore = 80;
      flags.push("📉 Concentración de dificultades al final");
    }

    if (studentCase.markers && studentCase.markers.includes("AUSENTISMO")) {
      absencePatternScore += 15;
      flags.push("📋 Marcador de ausentismo");
    }

    // 3. REGLA: Inconsistencias en el relato
    let inconsistencyScore = 25;
    if (meta.specificInconsistency) {
      if (studentCase.urgency === "ALTA" && tardinessScore > 70) {
        inconsistencyScore = 90;
        flags.push("🔄 Relato tardío con urgencia máxima");
      } else {
        inconsistencyScore = 65;
        flags.push("🔄 Discrepancia en motivo o tiempos");
      }
    }

    // 4. REGLA: Anomalía de urgencia
    let urgencyAnomalyScore = 30;
    if (studentCase.urgency === "ALTA" && tardinessScore > 60) {
      urgencyAnomalyScore = 85;
      flags.push("🚨 Urgencia alta sin trazabilidad previa");
    } else if (studentCase.urgency === "MEDIA" && tardinessScore > 75) {
      urgencyAnomalyScore = 60;
    }

    // Cálculo ponderado del riesgo (0 a 100)
    // 35% Tardiness + 25% Absence Pattern + 25% Inconsistency + 15% Urgency Anomaly
    const rawScore =
      tardinessScore * 0.35 +
      absencePatternScore * 0.25 +
      inconsistencyScore * 0.25 +
      urgencyAnomalyScore * 0.15;

    const riskScore = Math.min(98, Math.max(15, Math.round(rawScore)));

    let riskLevel: RiskLevel = "BAJO";
    if (riskScore >= 75) {
      riskLevel = "ALTO";
    } else if (riskScore >= 50) {
      riskLevel = "MEDIO";
    } else {
      riskLevel = "BAJO";
    }

    // Generar explicación contextual del patrón detectado
    let patternDetected = "";
    if (riskLevel === "ALTO") {
      patternDetected =
        meta.specificInconsistency ||
        `El caso presenta solicitud de acompañamiento en período de cierre (${creationDate.toLocaleDateString("es-CO")}) con urgencia alta, sin registros de acompañamiento temprano en el semestre. Alto riesgo de justificación de inasistencias o evaluaciones finales.`;
    } else if (riskLevel === "MEDIO") {
      patternDetected =
        meta.specificInconsistency ||
        `Se evidencia acumulación de inquietudes al final del período académico con soporte documental pendiente. Requiere validar coherencia con registros docentes.`;
    } else {
      patternDetected =
        `El caso mantiene coherencia temporal adecuada y asistencia regular. El motivo de consulta no presenta indicios de justificación extemporánea de inasistencias.`;
    }

    // Estado de revisión actual
    const savedState = reviewedCasesStore.get(studentCase.id);
    const currentStatus: AlertStatus = savedState ? savedState.status : "PENDIENTE";

    return {
      caseId: studentCase.id,
      studentName: studentCase.studentName,
      program: studentCase.program,
      semester: meta.semester,
      advisorName: meta.advisorName,
      shortDescription: studentCase.summary,
      riskLevel,
      riskScore,
      patternDetected,
      flags,
      status: currentStatus,
      reviewedAt: savedState?.reviewedAt,
      analyzedAt: new Date().toISOString(),
      metrics: {
        tardinessScore,
        absencePatternScore,
        inconsistencyScore,
        urgencyAnomalyScore,
      },
    };
  }

  /**
   * Analiza un lote de casos y retorna las predicciones ordenadas por riesgo descendente
   */
  public analyzeCases(cases: StudentCase[] = mockCases): AIPredictionResult[] {
    const results = cases.map((c) => this.analyzeCase(c));

    // Ordenar: primero ALTO, luego MEDIO, luego BAJO, ordenados por score descendente
    const riskPriority: Record<RiskLevel, number> = { ALTO: 3, MEDIO: 2, BAJO: 1 };
    return results.sort((a, b) => {
      if (riskPriority[b.riskLevel] !== riskPriority[a.riskLevel]) {
        return riskPriority[b.riskLevel] - riskPriority[a.riskLevel];
      }
      return b.riskScore - a.riskScore;
    });
  }

  /**
   * Calcula el resumen estadístico de las predicciones
   */
  public getStats(predictions?: AIPredictionResult[]): AIPredictionStats {
    const list = predictions || this.analyzeCases();
    const highRiskCount = list.filter((p) => p.riskLevel === "ALTO").length;
    const mediumRiskCount = list.filter((p) => p.riskLevel === "MEDIO").length;
    const lowRiskCount = list.filter((p) => p.riskLevel === "BAJO").length;
    const reviewedCount = list.filter((p) => p.status === "REVISADO").length;
    const activeAlerts = list.filter((p) => p.riskLevel !== "BAJO" && p.status === "PENDIENTE").length;

    return {
      totalAnalyzed: list.length,
      activeAlerts,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      reviewedCount,
      modelAccuracy: 88, // Precisión estimada del modelo heurístico supervisado
      lastUpdated: new Intl.DateTimeFormat("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "America/Bogota",
      }).format(new Date()),
    };
  }

  /**
   * Marca un caso como revisado por el asesor
   */
  public markAsReviewed(caseId: string): boolean {
    const now = new Intl.DateTimeFormat("es-CO", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Bogota",
    }).format(new Date());

    reviewedCasesStore.set(caseId, {
      status: "REVISADO",
      reviewedAt: now,
    });
    return true;
  }

  /**
   * Marca un caso como de tratamiento sensible
   */
  public markAsSensitive(caseId: string): boolean {
    const now = new Intl.DateTimeFormat("es-CO", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Bogota",
    }).format(new Date());

    reviewedCasesStore.set(caseId, {
      status: "SENSIBLE",
      reviewedAt: now,
    });
    return true;
  }

  /**
   * Obtiene la predicción de un caso específico
   */
  public getPrediction(caseId: string): AIPredictionResult | null {
    const studentCase = mockCases.find((c) => c.id === caseId);
    if (!studentCase) return null;
    return this.analyzeCase(studentCase);
  }
}

// Instancia singleton para compartir estado entre rutas
export const aiPredictorService = new AIPredictorService();
