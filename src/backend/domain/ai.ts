export type RiskSeverity = "BAJO" | "MEDIO" | "ALTO_SOSPECHA";

export interface InconsistencyFlag {
  code: string;
  label: string;
  weight: number; // 0 to 100
  detail: string;
}

export interface InconsistencyEvaluation {
  id: string;
  studentId: string;
  studentName: string;
  caseId?: string;
  semesterId: string;
  excuseText: string;
  submissionWeek: number; // 1 to 16
  absenceWeeksClaimed: number;
  priorMeetingsInEnlace: number;
  inconsistencyScore: number; // 0 (muy creíble) a 100 (alta sospecha de falso positivo)
  riskCategory: RiskSeverity;
  flags: InconsistencyFlag[];
  aiAnalysisSummary: string;
  recommendedActions: string[];
  reviewedByAdvisor: boolean;
  advisorVerdict?: "CONFIRMADO_GENUINO" | "FALSO_POSITIVO_CONFIRMADO" | "EN_REVISION";
  evaluatedAt: string;
}

export interface EvaluationInput {
  studentId: string;
  studentName: string;
  caseId?: string;
  semesterId: string;
  excuseText: string;
  submissionWeek: number;
  absenceWeeksClaimed: number;
  failedSubjectsCount: number;
}
