import type { MarcadorId } from "../../data/marcadores";

export const statusLabels = {
  REGISTRADO: "Registrado",
  NUEVO: "Nuevo",
  EN_SEGUIMIENTO: "En seguimiento",
  EN_ESPERA: "En espera",
  CERRADO: "Cerrado",
} as const;

export const statusIcons = {
  REGISTRADO: "＋",
  NUEVO: "●",
  EN_SEGUIMIENTO: "↻",
  EN_ESPERA: "◷",
  CERRADO: "✓",
} as const;

export const urgencyLabels = {
  ALTA: "Alta",
  MEDIA: "Media",
  BAJA: "Baja",
} as const;

export type CaseStatus = keyof typeof statusLabels;
export type Urgency = keyof typeof urgencyLabels;

export interface CaseEvent {
  date: string;
  type: string;
  description: string;
}

export interface StudentCase {
  id: string;
  studentName: string;
  program: string;
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
}

export interface NewCase {
  studentName: string;
  email: string | null;
  tieneCorreoInstitucional: boolean;
  contactEmail?: string;
  program: string;
  summary: string;
  observacionesAsesor?: string;
  markers: MarcadorId[];
}
