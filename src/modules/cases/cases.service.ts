import { MARCADORES, type MarcadorId } from "../../data/marcadores";
import { PROGRAMAS } from "../../data/programas";
import {
  statusLabels,
  type CaseStatus,
  type NewCase,
  type StudentCase,
} from "./cases.model";

export interface CaseFilter {
  status?: CaseStatus;
  program?: string;
  search?: string;
}

export interface CasesRepository {
  list(filter?: CaseFilter): Promise<StudentCase[]>;
  getById(id: string): Promise<StudentCase | null>;
  create(input: NewCase): Promise<StudentCase>;
}

export class DuplicateEmailError extends Error {}

export type CaseFormValues = {
  studentName: string;
  email: string;
  program: string;
  summary: string;
  markers: string[];
};

export type CaseFormErrors = Partial<Record<keyof CaseFormValues, string>>;

export function validateCase(values: CaseFormValues): CaseFormErrors {
  const errors: CaseFormErrors = {};
  const name = values.studentName.trim();
  const email = values.email.trim();
  const summary = values.summary.trim();
  if (name.length < 3 || name.length > 100)
    errors.studentName = "Escribe un nombre entre 3 y 100 caracteres.";
  if (
    !/^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@campusucc\.edu\.co$/i.test(
      email,
    )
  )
    errors.email = "Ingresa un correo válido terminado en @campusucc.edu.co.";
  if (!PROGRAMAS.some((program) => program === values.program))
    errors.program = "Selecciona un programa válido.";
  if (summary.length < 20 || summary.length > 1000)
    errors.summary = "Escribe una descripción entre 20 y 1000 caracteres.";
  const ids = new Set<string>(MARCADORES.map((marker) => marker.id));
  if (!values.markers.length || values.markers.some((id) => !ids.has(id)))
    errors.markers = "Selecciona al menos un marcador válido.";
  return errors;
}

export interface CaseQuery {
  status: string;
  program: string;
  search: string;
}

function isCaseStatus(value: string): value is CaseStatus {
  return Object.prototype.hasOwnProperty.call(statusLabels, value);
}

export class CasesService {
  constructor(private readonly repo: CasesRepository) {}

  list(filter?: CaseFilter): Promise<StudentCase[]> {
    return this.repo.list(filter);
  }

  async listWithFilters(query: CaseQuery) {
    const allCases = await this.repo.list();
    const programs = [...new Set(allCases.map((item) => item.program))].sort(
      (left, right) => left.localeCompare(right, "es-CO"),
    );
    const filters = {
      status: isCaseStatus(query.status) ? query.status : undefined,
      program: programs.includes(query.program) ? query.program : undefined,
      search: query.search.trim(),
    };

    return {
      cases: await this.repo.list(filters),
      programs,
      filters,
    };
  }

  async getById(id: string): Promise<StudentCase | null> {
    const studentCase = await this.repo.getById(id);
    if (!studentCase) return null;

    return {
      ...studentCase,
      events: [...studentCase.events].sort(
        (left, right) =>
          new Date(left.date).getTime() - new Date(right.date).getTime(),
      ),
    };
  }

  create(values: CaseFormValues): Promise<StudentCase> {
    const errors = validateCase(values);
    if (Object.keys(errors).length)
      throw new Error("No se puede crear un caso con datos inválidos.");
    return this.repo.create({
      studentName: values.studentName.trim(),
      email: values.email.trim().toLowerCase(),
      program: values.program,
      summary: values.summary.trim(),
      markers: [...new Set(values.markers)] as MarcadorId[],
    });
  }
}
