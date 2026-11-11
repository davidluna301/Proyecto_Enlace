import type { StudentCase } from "../modules/cases/cases.model";

export const mockCases: StudentCase[] = [
  {
    id: "EN-2026-001",
    studentName: "Valentina Gómez",
    program: "Psicología",
    status: "EN_SEGUIMIENTO",
    urgency: "ALTA",
    lastMovement: "2026-11-09T14:30:00-05:00",
    tieneCorreoInstitucional: true,
    markers: [],
    summary:
      "La estudiante solicita orientación para retomar sus actividades académicas y definir un plan de acompañamiento.",
    events: [
      {
        date: "2026-10-28T09:00:00-05:00",
        type: "Caso creado",
        description: "Se recibió la solicitud de acompañamiento.",
      },
      {
        date: "2026-11-02T11:15:00-05:00",
        type: "Contacto inicial",
        description:
          "Se realizó el primer acercamiento y se acordó una conversación.",
      },
      {
        date: "2026-11-09T14:30:00-05:00",
        type: "Seguimiento",
        description:
          "Quedó pendiente definir el plan de apoyo con la estudiante.",
      },
    ],
  },
  {
    id: "EN-2026-002",
    studentName: "Juan Sebastián López",
    program: "Ingeniería de Sistemas",
    status: "NUEVO",
    urgency: "MEDIA",
    lastMovement: "2026-11-10T08:45:00-05:00",
    tieneCorreoInstitucional: true,
    markers: [],
    summary:
      "El estudiante pidió acompañamiento para organizar su carga académica.",
    events: [
      {
        date: "2026-11-10T08:45:00-05:00",
        type: "Caso creado",
        description: "Se registró la solicitud de orientación académica.",
      },
    ],
  },
  {
    id: "EN-2026-003",
    studentName: "Laura Camila Torres",
    program: "Derecho",
    status: "EN_ESPERA",
    urgency: "BAJA",
    lastMovement: "2026-11-06T16:20:00-05:00",
    tieneCorreoInstitucional: true,
    markers: [],
    summary:
      "Se espera que la estudiante confirme el horario para su próximo encuentro.",
    events: [
      {
        date: "2026-10-20T10:00:00-05:00",
        type: "Caso creado",
        description:
          "Se solicitó orientación para equilibrar estudio y trabajo.",
      },
      {
        date: "2026-11-06T16:20:00-05:00",
        type: "Seguimiento",
        description:
          "Se enviaron opciones de horario para el próximo encuentro.",
      },
    ],
  },
  {
    id: "EN-2026-004",
    studentName: "Samuel Andrés Herrera",
    program: "Administración de Empresas",
    status: "EN_SEGUIMIENTO",
    urgency: "MEDIA",
    lastMovement: "2026-11-08T10:10:00-05:00",
    tieneCorreoInstitucional: true,
    markers: [],
    summary:
      "Está construyendo un plan para prepararse para sus evaluaciones de cierre.",
    events: [
      {
        date: "2026-10-15T13:00:00-05:00",
        type: "Caso creado",
        description: "El estudiante pidió apoyo para planear su semestre.",
      },
      {
        date: "2026-11-08T10:10:00-05:00",
        type: "Encuentro",
        description: "Se revisaron avances y se acordaron próximos pasos.",
      },
    ],
  },
  {
    id: "EN-2026-005",
    studentName: "Isabella Martínez",
    program: "Enfermería",
    status: "NUEVO",
    urgency: "ALTA",
    lastMovement: "2026-11-10T11:05:00-05:00",
    tieneCorreoInstitucional: true,
    markers: [],
    summary:
      "La estudiante requiere una conversación prioritaria sobre su continuidad académica.",
    events: [
      {
        date: "2026-11-10T11:05:00-05:00",
        type: "Caso creado",
        description: "Se recibió una solicitud de acompañamiento prioritario.",
      },
    ],
  },
  {
    id: "EN-2026-006",
    studentName: "Mateo Alejandro Ruiz",
    program: "Ingeniería Industrial",
    status: "CERRADO",
    urgency: "BAJA",
    lastMovement: "2026-10-30T15:40:00-05:00",
    tieneCorreoInstitucional: true,
    markers: [],
    summary: "El estudiante completó el acompañamiento acordado.",
    events: [
      {
        date: "2026-09-18T08:30:00-05:00",
        type: "Caso creado",
        description:
          "Se acordó acompañamiento para fortalecer hábitos de estudio.",
      },
      {
        date: "2026-10-30T15:40:00-05:00",
        type: "Caso cerrado",
        description: "El estudiante completó los objetivos definidos.",
      },
    ],
  },
  {
    id: "EN-2026-007",
    studentName: "Mariana Alejandra Castro",
    program: "Psicología",
    status: "EN_ESPERA",
    urgency: "MEDIA",
    lastMovement: "2026-11-07T09:25:00-05:00",
    tieneCorreoInstitucional: true,
    markers: [],
    summary:
      "Está pendiente recibir la confirmación de una actividad de bienestar.",
    events: [
      {
        date: "2026-10-24T12:15:00-05:00",
        type: "Caso creado",
        description: "Se registró una solicitud de orientación y bienestar.",
      },
      {
        date: "2026-11-07T09:25:00-05:00",
        type: "Remisión",
        description: "Se compartió información de una actividad de bienestar.",
      },
    ],
  },
  {
    id: "EN-2026-008",
    studentName: "Nicolás Felipe Moreno",
    program: "Comunicación Social",
    status: "EN_SEGUIMIENTO",
    urgency: "BAJA",
    lastMovement: "2026-11-04T14:00:00-05:00",
    tieneCorreoInstitucional: true,
    markers: [],
    summary:
      "El estudiante avanza en la organización de su proyecto de semestre.",
    events: [
      {
        date: "2026-10-12T10:45:00-05:00",
        type: "Caso creado",
        description: "Se solicitó apoyo para organizar entregas del semestre.",
      },
      {
        date: "2026-11-04T14:00:00-05:00",
        type: "Seguimiento",
        description: "Se revisó el cronograma y los avances del proyecto.",
      },
    ],
  },
  {
    id: "EN-2026-009",
    studentName: "Sofía Valeria Pérez",
    program: "Contaduría Pública",
    status: "EN_ESPERA",
    urgency: "ALTA",
    lastMovement: "2026-11-09T08:20:00-05:00",
    tieneCorreoInstitucional: true,
    markers: [],
    summary: "Está pendiente coordinar un espacio de conversación esta semana.",
    events: [
      {
        date: "2026-11-01T09:10:00-05:00",
        type: "Caso creado",
        description: "Se solicitó conversar sobre una dificultad académica.",
      },
      {
        date: "2026-11-09T08:20:00-05:00",
        type: "Contacto",
        description: "Se propuso coordinar un espacio prioritario esta semana.",
      },
    ],
  },
  {
    id: "EN-2026-010",
    studentName: "Samuel David Ortiz",
    program: "Ingeniería de Sistemas",
    status: "CERRADO",
    urgency: "BAJA",
    lastMovement: "2026-10-22T11:35:00-05:00",
    tieneCorreoInstitucional: true,
    markers: [],
    summary:
      "El estudiante recibió la orientación solicitada y cerró su proceso.",
    events: [
      {
        date: "2026-10-05T13:30:00-05:00",
        type: "Caso creado",
        description:
          "Se registró una consulta para organizar su ruta académica.",
      },
      {
        date: "2026-10-22T11:35:00-05:00",
        type: "Caso cerrado",
        description:
          "Se completó la orientación y el estudiante confirmó el cierre.",
      },
    ],
  },
];
