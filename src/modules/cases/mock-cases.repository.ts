import { mockCases } from "../../data/cases.mock";
import type { StudentCase } from "./cases.model";
import type { CaseFilter, CasesRepository } from "./cases.service";

export class MockCasesRepository implements CasesRepository {
  async list(filter: CaseFilter = {}): Promise<StudentCase[]> {
    const search = filter.search?.trim().toLocaleLowerCase("es-CO");
    return mockCases
      .filter((studentCase) => {
        if (filter.status && studentCase.status !== filter.status) return false;
        if (filter.program && studentCase.program !== filter.program)
          return false;
        if (
          search &&
          !`${studentCase.studentName} ${studentCase.id}`
            .toLocaleLowerCase("es-CO")
            .includes(search)
        ) {
          return false;
        }
        return true;
      })
      .sort(
        (left, right) =>
          new Date(right.lastMovement).getTime() -
          new Date(left.lastMovement).getTime(),
      );
  }

  async getById(id: string): Promise<StudentCase | null> {
    return mockCases.find((studentCase) => studentCase.id === id) ?? null;
  }
}
