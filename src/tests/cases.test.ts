import assert from "node:assert/strict";
import test from "node:test";
import type { StudentCase } from "../modules/cases/cases.model";
import {
  CasesService,
  type CaseFilter,
  type CasesRepository,
} from "../modules/cases/cases.service";
import { MockCasesRepository } from "../modules/cases/mock-cases.repository";

test("el servicio usa el repositorio inyectado para programas y filtros", async () => {
  const sample: StudentCase = {
    id: "TEST-001",
    studentName: "Estudiante de prueba",
    program: "Programa externo",
    status: "NUEVO",
    urgency: "MEDIA",
    lastMovement: "2026-01-02T10:00:00-05:00",
    summary: "Caso de prueba.",
    events: [
      { date: "2026-01-02T10:00:00-05:00", type: "Segundo", description: "" },
      { date: "2026-01-01T10:00:00-05:00", type: "Primero", description: "" },
    ],
  };
  let receivedFilter: CaseFilter | undefined;
  const repository: CasesRepository = {
    async list(filter) {
      receivedFilter = filter;
      return [sample];
    },
    async getById(id) {
      return id === sample.id ? sample : null;
    },
  };
  const service = new CasesService(repository);

  const result = await service.listWithFilters({
    status: "NUEVO",
    program: "Programa externo",
    search: "  TEST-001  ",
  });
  assert.deepEqual(result.programs, ["Programa externo"]);
  assert.deepEqual(receivedFilter, {
    status: "NUEVO",
    program: "Programa externo",
    search: "TEST-001",
  });

  const detail = await service.getById("TEST-001");
  assert.deepEqual(
    detail?.events.map((event) => event.type),
    ["Primero", "Segundo"],
  );
  assert.equal(sample.events[0].type, "Segundo");
  assert.equal(await service.getById("missing"), null);
});

test("el repositorio mock combina búsqueda, estado y programa", async () => {
  const repository = new MockCasesRepository();
  const result = await repository.list({
    status: "NUEVO",
    program: "Ingeniería de Sistemas",
    search: "en-2026-002",
  });
  assert.deepEqual(
    result.map((item) => item.id),
    ["EN-2026-002"],
  );
  assert.deepEqual(await repository.list({ search: "sin coincidencias" }), []);
});
