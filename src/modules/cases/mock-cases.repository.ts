import { mockCases } from "../../data/cases.mock";
import type { NewCase, StudentCase } from "./cases.model";
import {
  DuplicateEmailError,
  type CaseFilter,
  type CasesRepository,
} from "./cases.service";

export class MockCasesRepository implements CasesRepository {
  private readonly cases = structuredClone(mockCases);

  async list(filter: CaseFilter = {}): Promise<StudentCase[]> {
    const search = filter.search?.trim().toLocaleLowerCase("es-CO");
    return this.cases
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
    return this.cases.find((studentCase) => studentCase.id === id) ?? null;
  }

  async create(input: NewCase): Promise<StudentCase> {
    if (this.cases.some((item) => item.email?.toLowerCase() === input.email)) {
      throw new DuplicateEmailError("Ya existe un caso para este correo.");
    }
    const now = new Date();
    const prefix = `CASO-${now.getFullYear()}-`;
    const numbers = this.cases
      .filter((item) => item.id.startsWith(prefix))
      .map((item) => Number(item.id.slice(prefix.length)))
      .filter(Number.isSafeInteger);
    const id = prefix + String(Math.max(0, ...numbers) + 1).padStart(4, "0");
    const date = now.toISOString();
    const studentCase: StudentCase = {
      ...input,
      id,
      status: "REGISTRADO",
      urgency: "MEDIA",
      lastMovement: date,
      events: [
        {
          date,
          type: "Caso creado",
          description: "Se registró la solicitud de acompañamiento.",
        },
      ],
    };
    this.cases.push(studentCase);
    return studentCase;
  }
}
