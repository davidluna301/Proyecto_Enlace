export interface SemesterStats {
  totalAppointments: number;
  completedAppointments: number;
  rescheduledAppointments: number;
  totalCases: number;
  criticalCases: number;
  flaggedInconsistencies: number;
}

export interface Semester {
  id: string; // e.g. "2026-2"
  name: string; // e.g. "Semestre Académico 2026-II"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isActive: boolean;
  qrToken: string;
  qrUrlPath: string; // e.g. "/estudiante?semestre=2026-2"
  closedAt?: string;
  stats?: SemesterStats;
}
