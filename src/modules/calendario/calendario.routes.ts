// src/modules/calendario/calendario.routes.ts
// Rutas del módulo de Calendario y Agenda ENLACE UCC
import { Router, Request, Response } from "express";
import { requireAuth } from "../../middlewares/auth";

export interface CitaCalendario {
  id: string;
  estudianteId: string;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
  carrera: string;
  semestre: number;
  fecha: string; // YYYY-MM-DD
  hora: string; // '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM'
  modalidad: "virtual" | "presencial";
  motivo: string;
  psicologo: string;
  estado: "confirmada" | "atendida" | "reagendada" | "cancelada";
  lugar?: string;
  enlaceMeet?: string;
}

export interface EventoEspecial {
  id: string;
  fecha: string;
  tipo: "evento" | "cambio-horario" | "no-disponible";
  titulo: string;
  descripcion: string;
  franjaAfectada?: string;
}

// Citas iniciales para demostración (horario 2:00 PM - 4:00 PM)
export const CITAS_DEMO: CitaCalendario[] = [
  {
    id: "CITA-2026-001",
    estudianteId: "1002345678",
    nombre: "Carlos Alberto",
    apellidos: "Pérez Gómez",
    correo: "carlos.perezg@campusucc.edu.co",
    telefono: "3104567890",
    carrera: "Ingeniería de Sistemas",
    semestre: 6,
    fecha: "2026-11-17",
    hora: "2:00 PM",
    modalidad: "virtual",
    motivo: "Dificultades de concentración y rendimiento académico en cálculo.",
    psicologo: "Dra. María Fernanda Ríos",
    estado: "confirmada",
    enlaceMeet: "https://meet.google.com/enl-ucc-001",
  },
  {
    id: "CITA-2026-002",
    estudianteId: "1002987654",
    nombre: "Luisa Mariana",
    apellidos: "Martínez Rojas",
    correo: "luisa.martinezr@campusucc.edu.co",
    telefono: "3156781234",
    carrera: "Psicología",
    semestre: 4,
    fecha: "2026-11-17",
    hora: "3:00 PM",
    modalidad: "presencial",
    motivo: "Manejo de ansiedad ante evaluaciones y situaciones personales.",
    psicologo: "Dra. Patricia Morales Gómez",
    estado: "confirmada",
    lugar: "Consultorio Bienestar Universitario - Bloque B, Oficina 204",
  },
  {
    id: "CITA-2026-003",
    estudianteId: "1003112233",
    nombre: "Andrés Felipe",
    apellidos: "Silva Castaño",
    correo: "andres.silvac@campusucc.edu.co",
    telefono: "3209876543",
    carrera: "Contaduría Pública",
    semestre: 2,
    fecha: "2026-11-18",
    hora: "2:30 PM",
    modalidad: "virtual",
    motivo: "Orientación vocacional y adaptación a la vida universitaria.",
    psicologo: "Dr. Jhon Álvarez Mora",
    estado: "confirmada",
    enlaceMeet: "https://meet.google.com/enl-ucc-002",
  },
  {
    id: "CITA-2026-004",
    estudianteId: "1004556677",
    nombre: "Jimena Sofía",
    apellidos: "Ortiz Valencia",
    correo: "jimena.ortizv@campusucc.edu.co",
    telefono: "3123456781",
    carrera: "Medicina",
    semestre: 8,
    fecha: "2026-11-19",
    hora: "2:00 PM",
    modalidad: "presencial",
    motivo: "Seguimiento emocional y gestión del estrés en rotaciones clínicas.",
    psicologo: "Dra. María Fernanda Ríos",
    estado: "confirmada",
    lugar: "Consultorio Bienestar Universitario - Bloque B, Oficina 204",
  },
  {
    id: "CITA-2026-005",
    estudianteId: "1005889900",
    nombre: "Pedro Antonio",
    apellidos: "Ramírez Henao",
    correo: "pedro.ramirezh@campusucc.edu.co",
    telefono: "3145678912",
    carrera: "Derecho",
    semestre: 3,
    fecha: "2026-11-19",
    hora: "3:30 PM",
    modalidad: "virtual",
    motivo: "Primera cita de acompañamiento y orientación académica.",
    psicologo: "Dr. Jhon Álvarez Mora",
    estado: "confirmada",
    enlaceMeet: "https://meet.google.com/enl-ucc-003",
  },
  {
    id: "CITA-2026-006",
    estudianteId: "1006123987",
    nombre: "Valentina",
    apellidos: "López Duque",
    correo: "valentina.lopezd@campusucc.edu.co",
    telefono: "3187654321",
    carrera: "Enfermería",
    semestre: 5,
    fecha: "2026-11-20",
    hora: "2:00 PM",
    modalidad: "presencial",
    motivo: "Estrategias de organización del tiempo y técnicas de estudio.",
    psicologo: "Dra. Patricia Morales Gómez",
    estado: "confirmada",
    lugar: "Consultorio Bienestar Universitario - Bloque B, Oficina 204",
  },
  {
    id: "CITA-2026-007",
    estudianteId: "1007654321",
    nombre: "Santiago",
    apellidos: "Gutiérrez Meza",
    correo: "santiago.gutierrezm@campusucc.edu.co",
    telefono: "3001239876",
    carrera: "Administración de Empresas",
    semestre: 7,
    fecha: "2026-11-24",
    hora: "3:00 PM",
    modalidad: "virtual",
    motivo: "Acompañamiento por sobrecarga académica y laboral.",
    psicologo: "Dr. Jhon Álvarez Mora",
    estado: "confirmada",
    enlaceMeet: "https://meet.google.com/enl-ucc-004",
  },
];

// Festivos de Colombia 2026 (Ley Emiliani)
export const FESTIVOS_COLOMBIA_2026: Record<string, string> = {
  "2026-01-01": "Año Nuevo",
  "2026-01-12": "Día de los Reyes Magos",
  "2026-03-23": "Día de San José",
  "2026-04-02": "Jueves Santo",
  "2026-04-03": "Viernes Santo",
  "2026-05-01": "Día del Trabajo",
  "2026-05-18": "Ascensión del Señor",
  "2026-06-08": "Corpus Christi",
  "2026-06-15": "Sagrado Corazón de Jesús",
  "2026-07-06": "San Pedro y San Pablo",
  "2026-07-20": "Día de la Independencia",
  "2026-08-07": "Batalla de Boyacá",
  "2026-08-17": "La Asunción de la Virgen",
  "2026-10-12": "Día de la Raza",
  "2026-11-02": "Día de Todos los Santos",
  "2026-11-16": "Independencia de Cartagena",
  "2026-12-08": "Inmaculada Concepción",
  "2026-12-25": "Navidad",
};

export function createCalendarioRouter(): Router {
  const router = Router();

  // Vista principal del Calendario (Mensual)
  router.get("/", requireAuth, (_req: Request, res: Response) => {
    res.render("calendario/index", {
      title: "Calendario de citas – ENLACE UCC",
      citas: CITAS_DEMO,
      festivos: FESTIVOS_COLOMBIA_2026,
    });
  });

  // API: Listar citas y eventos
  router.get("/api/eventos", requireAuth, (_req: Request, res: Response) => {
    res.json({
      ok: true,
      citas: CITAS_DEMO,
      festivos: FESTIVOS_COLOMBIA_2026,
      horarioAtencion: {
        inicio: "2:00 PM",
        fin: "4:00 PM",
        dias: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
      },
    });
  });

  // API: Agregar evento o cambio de horario
  router.post("/api/evento", requireAuth, (req: Request, res: Response) => {
    const { tipo, fecha, descripcion, franjaAfectada } = req.body;

    // Mensaje mandatorio de reagendamiento requerido por el sistema ENLACE
    const mensajeReagendamiento =
      "Recuerde comunicarse con el estudiante por teléfono, correo u otro medio";

    res.json({
      ok: true,
      mensaje: "Evento o novedad de horario registrada con éxito.",
      recordatorio: mensajeReagendamiento,
      data: {
        id: `EV-${Date.now()}`,
        tipo: tipo || "evento",
        fecha: fecha || new Date().toISOString().split("T")[0],
        descripcion: descripcion || "Sin descripción",
        franjaAfectada: franjaAfectada || "2:00 PM - 4:00 PM",
      },
    });
  });

  // API: Reagendar cita
  router.post("/api/reagendar", requireAuth, (req: Request, res: Response) => {
    const { citaId, nuevaFecha, nuevaHora, motivoCambio } = req.body;

    res.json({
      ok: true,
      mensaje: "Cita reagendada correctamente.",
      aviso: "Recuerde comunicarse con el estudiante por teléfono, correo u otro medio",
      data: {
        citaId,
        nuevaFecha,
        nuevaHora,
        motivoCambio,
      },
    });
  });

  return router;
}

export const calendarioRouter = createCalendarioRouter();
