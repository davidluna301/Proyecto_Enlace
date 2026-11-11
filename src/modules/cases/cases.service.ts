import { MARCADORES, type MarcadorId } from "../../data/marcadores";
import { PROGRAMAS } from "../../data/programas";
import { env } from "../../config/env";
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
  tieneCorreoInstitucional: boolean;
  contactEmail: string;
  program: string;
  summary: string;
  observacionesAsesor: string;
  includeMarkers: boolean;
  markers: string[];
};

export type CaseFormErrors = Partial<Record<keyof CaseFormValues, string>>;

const EMAIL_LOCAL_PATTERN =
  /^[A-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Z0-9!#$%&'*+/=?^_`{|}~-]+)*$/i;
const EMAIL_DOMAIN_PATTERN =
  /^[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i;

function isValidEmail(value: string): boolean {
  const [localPart, domain, extra] = value.split("@");
  return Boolean(
    value.length <= 254 &&
    localPart &&
    localPart.length <= 64 &&
    EMAIL_LOCAL_PATTERN.test(localPart) &&
    domain &&
    EMAIL_DOMAIN_PATTERN.test(domain) &&
    !extra,
  );
}

export function validateCase(values: CaseFormValues): CaseFormErrors {
  const errors: CaseFormErrors = {};
  const name = values.studentName.trim();
  const email = values.email.trim();
  const contactEmail = values.contactEmail.trim();
  const summary = values.summary.trim();
  if (name.length < 3 || name.length > 100 || !/^[\p{L}\p{M} ]+$/u.test(name)) {
    errors.studentName =
      "Escribe un nombre de 3 a 100 caracteres, usando solo letras y espacios.";
  }
  if (values.tieneCorreoInstitucional) {
    if (!isValidEmail(email)) {
      errors.email = "Ingresa un correo electrónico válido.";
    } else if (
      email.slice(email.lastIndexOf("@") + 1).toLowerCase() !==
      env.institutionalEmailDomain
    ) {
      errors.email = `El correo debe terminar en @${env.institutionalEmailDomain}.`;
    }
  }
  if (
    !values.tieneCorreoInstitucional &&
    contactEmail &&
    !isValidEmail(contactEmail)
  )
    errors.contactEmail = "Ingresa un correo de contacto válido.";
  if (!PROGRAMAS.some((program) => program === values.program))
    errors.program = "Selecciona un programa válido.";
  if (summary.length < 20 || summary.length > 1000)
    errors.summary = "Escribe una descripción entre 20 y 1000 caracteres.";
  if (values.observacionesAsesor.trim().length > 500)
    errors.observacionesAsesor =
      "Las observaciones no pueden superar 500 caracteres.";
  const ids = new Set<string>(MARCADORES.map((marker) => marker.id));
  if (
    values.includeMarkers &&
    (!values.markers.length || values.markers.some((id) => !ids.has(id)))
  ) {
    errors.markers = "Selecciona al menos un marcador válido.";
  }
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
    const markers = values.includeMarkers
      ? values.markers.filter((id): id is MarcadorId =>
          MARCADORES.some((marker) => marker.id === id),
        )
      : [];
    const email = values.tieneCorreoInstitucional
      ? values.email.trim().toLowerCase()
      : null;
    return this.repo.create({
      studentName: values.studentName.trim(),
      email,
      tieneCorreoInstitucional: values.tieneCorreoInstitucional,
      contactEmail:
        !values.tieneCorreoInstitucional && values.contactEmail.trim()
          ? values.contactEmail.trim().toLowerCase()
          : undefined,
      program: values.program,
      summary: values.summary.trim(),
      observacionesAsesor: values.observacionesAsesor.trim() || undefined,
      markers: [...new Set(markers)],
    });
  }
}
