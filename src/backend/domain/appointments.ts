export type AppointmentStatus =
  | "SOLICITADA"
  | "CONFIRMADA"
  | "REAGENDADA"
  | "CANCELADA"
  | "COMPLETADA";

export type Modality = "PRESENCIAL" | "VIRTUAL";

export const VALID_TIME_SLOTS = [
  "14:00",
  "14:30",
  "15:00",
  "15:30",
] as const;

export type TimeSlot = (typeof VALID_TIME_SLOTS)[number];

export interface Appointment {
  id: string;
  code: string; // e.g. "ENL-4819"
  semesterId: string;
  studentId: string; // ID Universitario
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  program: string;
  semester: number | string;
  advisorId: string;
  advisorName?: string;
  date: string; // YYYY-MM-DD
  timeSlot: TimeSlot | string;
  modality: Modality;
  reason: string;
  status: AppointmentStatus;
  rescheduleReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentBookingInput {
  semesterId?: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  program: string;
  semester: number | string;
  advisorId: string;
  date: string;
  timeSlot: string;
  modality: Modality;
  reason: string;
}

export interface BlockedDate {
  date: string; // YYYY-MM-DD
  advisorId: string;
  reason: string;
  createdAt: string;
}
