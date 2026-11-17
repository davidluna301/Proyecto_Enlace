import type { MarcadorId } from "../../data/marcadores";

export const statusLabels = {
  REGISTRADO: "Registrado",
  NUEVO: "Nuevo",
  EN_SEGUIMIENTO: "En seguimiento",
  EN_ESPERA: "En espera",
  ALERTA_TEMPRANA: "Alerta temprana",
  CASO_CRITICO: "Caso crítico",
  CERRADO: "Cerrado",
} as const;

export const statusIcons = {
  REGISTRADO: "＋",
  NUEVO: "●",
  EN_SEGUIMIENTO: "↻",
  EN_ESPERA: "◷",
  ALERTA_TEMPRANA: "⚠",
  CASO_CRITICO: "🚨",
  CERRADO: "✓",
} as const;

export const urgencyLabels = {
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
  CRITICA: "Crítica",
} as const;

export type CaseStatus = keyof typeof statusLabels;
export type Urgency = keyof typeof urgencyLabels;

export type CriticalLevel = 1 | 2 | 3 | 4 | 5;

export interface CriticalMarker {
  level: CriticalLevel; // 1: Verde (Bienestar/Estable) -> 5: Rojo (Riesgo Inminente/Crítico)
  isSensitive: boolean;
  category: "EMOCIONAL" | "ACADEMICO" | "SOCIOECONOMICO" | "FAMILIAR" | "SALUD_MENTAL";
  notes?: string;
  updatedAt: string;
}

export const CRITICAL_LEVEL_METADATA: Record<
  CriticalLevel,
  { emoji: string; label: string; color: string; bgClass: string; description: string }
> = {
  1: {
    emoji: "😊",
    label: "Nivel 1 - Estable / Adaptación Positiva",
    color: "#28a745",
    bgClass: "marker-level-1",
    description: "Estudiante con estado emocional estable y factores protectores activos.",
  },
  2: {
    emoji: "🙂",
    label: "Nivel 2 - Leve / Estrés Académico Común",
    color: "#74b033",
    bgClass: "marker-level-2",
    description: "Sobrecarga o dudas en asignaturas pero con receptividad al apoyo.",
  },
  3: {
    emoji: "😐",
    label: "Nivel 3 - Moderado / Desmotivación",
    color: "#ffc107",
    bgClass: "marker-level-3",
    description: "Riesgo intermedio de reprobación o dificultades de concentración.",
  },
  4: {
    emoji: "😟",
    label: "Nivel 4 - Alto / Vulnerabilidad Marcada",
    color: "#fd7e14",
    bgClass: "marker-level-4",
    description: "Ansiedad severa, problemas familiares o ausencias continuas.",
  },
  5: {
    emoji: "🔴",
    label: "Nivel 5 - Crítico / Alerta Inmediata",
    color: "#dc3545",
    bgClass: "marker-level-5",
    description: "Riesgo psicosocial severo, crisis emocional o deserción inminente.",
  },
};

export interface CaseEvent {
  date: string;
  type: string;
  description: string;
}

export interface StudentCase {
  id: string;
  advisorId: string;
  studentId?: string; // ID / Documento universitario
  studentName: string;
  program: string;
  semester?: number | string;
  phone?: string;
  status: CaseStatus;
  urgency: Urgency;
  lastMovement: string;
  summary: string;
  events: CaseEvent[];
  email?: string | null;
  tieneCorreoInstitucional: boolean;
  contactEmail?: string;
  observacionesAsesor?: string;
  markers: MarcadorId[];
  criticalMarker?: CriticalMarker;
  voiceNotesTranscript?: string;
}
