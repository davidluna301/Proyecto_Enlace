import { statusLabels, type CaseStatus, type StudentCase } from "./cases.model";

export interface CaseFilter {
  status?: CaseStatus;
  program?: string;
  search?: string;
}

export interface CasesRepository {
  list(filter?: CaseFilter): Promise<StudentCase[]>;
  getById(id: string): Promise<StudentCase | null>;
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
}
