export type CategoriaMarcador =
  "ACADEMICO" | "SOCIOECONOMICO" | "PSICOSOCIAL" | "INSTITUCIONAL";

export const CATEGORIAS: Record<CategoriaMarcador, string> = {
  ACADEMICO: "Académicos y de asistencia",
  SOCIOECONOMICO: "Socioeconómicos y familiares",
  PSICOSOCIAL: "Psicosociales y de salud mental",
  INSTITUCIONAL: "Institucionales y del entorno",
};

export const MARCADORES = [
  {
    id: "AUSENTISMO",
    nombre: "Ausentismo crónico o intermitente",
    descripcion:
      "Ausencias repetidas o discontinuas que dificultan la continuidad.",
    categoria: "ACADEMICO",
  },
  {
    id: "REPROBACION",
    nombre: "Reprobación y rezago escolar",
    descripcion: "Dificultades para avanzar en la trayectoria académica.",
    categoria: "ACADEMICO",
  },
  {
    id: "RENDIMIENTO",
    nombre: "Caída brusca en el rendimiento",
    descripcion: "Cambio notable en resultados o participación académica.",
    categoria: "ACADEMICO",
  },
  {
    id: "TRANSICION",
    nombre: "Transiciones críticas y traslados",
    descripcion: "Cambios de programa, sede o etapa que requieren adaptación.",
    categoria: "ACADEMICO",
  },
  {
    id: "VINCULACION_LABORAL",
    nombre: "Necesidad de vinculación laboral o doméstica",
    descripcion:
      "Responsabilidades laborales o de cuidado que compiten con el estudio.",
    categoria: "SOCIOECONOMICO",
  },
  {
    id: "INESTABILIDAD_ECONOMICA",
    nombre: "Inestabilidad económica y desplazamiento",
    descripcion:
      "Dificultades de recursos o cambios de residencia que afectan la continuidad.",
    categoria: "SOCIOECONOMICO",
  },
  {
    id: "BAJA_PARTICIPACION",
    nombre: "Baja participación familiar",
    descripcion:
      "El estudiante identifica escaso apoyo de su entorno familiar.",
    categoria: "SOCIOECONOMICO",
  },
  {
    id: "AISLAMIENTO",
    nombre: "Aislamiento y desconexión emocional",
    descripcion:
      "Señales de desconexión de la comunidad o actividades habituales.",
    categoria: "PSICOSOCIAL",
  },
  {
    id: "ACOSO",
    nombre: "Acoso escolar y conflictos",
    descripcion:
      "Situaciones de hostigamiento o conflicto que afectan la participación.",
    categoria: "PSICOSOCIAL",
  },
  {
    id: "SALUD_MENTAL",
    nombre: "Problemas de salud mental y violencia",
    descripcion:
      "Situaciones de bienestar o violencia que requieren acompañamiento.",
    categoria: "PSICOSOCIAL",
  },
  {
    id: "APOYOS_PEDAGOGICOS",
    nombre: "Falta de apoyos pedagógicos",
    descripcion: "Barreras para recibir apoyos necesarios para el aprendizaje.",
    categoria: "INSTITUCIONAL",
  },
  {
    id: "CLIMA_RIGIDO",
    nombre: "Clima escolar rígido",
    descripcion: "Condiciones institucionales que dificultan la participación.",
    categoria: "INSTITUCIONAL",
  },
  {
    id: "BARRERAS_ACCESO",
    nombre: "Barreras de acceso",
    descripcion:
      "Obstáculos físicos, tecnológicos o de transporte para participar.",
    categoria: "INSTITUCIONAL",
  },
] as const satisfies readonly {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: CategoriaMarcador;
}[];

export type MarcadorId = (typeof MARCADORES)[number]["id"];
export interface Marcador {
  id: MarcadorId;
  nombre: string;
  descripcion: string;
  categoria: CategoriaMarcador;
}

export const GRUPOS_MARCADORES = (
  Object.entries(CATEGORIAS) as [CategoriaMarcador, string][]
).map(([id, nombre]) => ({
  id,
  nombre,
  marcadores: MARCADORES.filter((marcador) => marcador.categoria === id),
}));
