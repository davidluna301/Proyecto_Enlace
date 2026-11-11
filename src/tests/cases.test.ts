import assert from "node:assert/strict";
import test from "node:test";
import type { StudentCase } from "../modules/cases/cases.model";
import {
  CasesService,
  validateCase,
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
    tieneCorreoInstitucional: true,
    markers: [],
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
    async create() {
      return sample;
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

test("el registro valida límites, dominio, programa y marcadores", () => {
  const valid = {
    studentName: "Ana",
    email: "ana@campusucc.edu.co",
    tieneCorreoInstitucional: true,
    contactEmail: "",
    program: "Psicología",
    summary: "x".repeat(20),
    observacionesAsesor: "",
    includeMarkers: true,
    markers: ["AUSENTISMO"],
  };
  assert.deepEqual(validateCase(valid), {});
  assert.deepEqual(validateCase({ ...valid, studentName: "Ana María" }), {});
  assert.ok(validateCase({ ...valid, studentName: "ab" }).studentName);
  assert.ok(
    validateCase({ ...valid, studentName: "a".repeat(101) }).studentName,
  );
  assert.ok(
    validateCase({ ...valid, email: "ana..uno@campusucc.edu.co" }).email,
  );
  assert.ok(validateCase({ ...valid, email: ".ana@campusucc.edu.co" }).email);
  assert.ok(validateCase({ ...valid, email: "ana@ucc.edu.co" }).email);
  assert.ok(validateCase({ ...valid, program: "otro" }).program);
  assert.ok(validateCase({ ...valid, summary: "x".repeat(19) }).summary);
  assert.ok(validateCase({ ...valid, summary: "x".repeat(1001) }).summary);
  assert.ok(validateCase({ ...valid, markers: [] }).markers);
  assert.ok(validateCase({ ...valid, markers: ["INVENTADO"] }).markers);
  assert.deepEqual(
    validateCase({ ...valid, includeMarkers: false, markers: [] }),
    {},
  );
  assert.deepEqual(
    validateCase({
      ...valid,
      tieneCorreoInstitucional: false,
      email: "",
      contactEmail: "contacto@example.com",
      includeMarkers: false,
      markers: [],
    }),
    {},
  );
  assert.ok(
    validateCase({
      ...valid,
      tieneCorreoInstitucional: false,
      email: "",
      contactEmail: "correo inválido",
    }).contactEmail,
  );
  assert.ok(
    validateCase({ ...valid, observacionesAsesor: "x".repeat(501) })
      .observacionesAsesor,
  );
  assert.ok(validateCase({ ...valid, studentName: "Ana María 2" }).studentName);
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
