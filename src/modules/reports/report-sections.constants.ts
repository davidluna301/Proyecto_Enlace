export type SeccionReporteId =
  | "DATOS_ESTUDIANTE"
  | "DESCRIPCION_CASO"
  | "MARCADORES_CRITICOS"
  | "OBSERVACIONES_ASESOR"
  | "ESTADO_URGENCIA"
  | "FECHAS_CLAVE"
  | "LINEA_TIEMPO";

export interface SeccionReporte {
  id: SeccionReporteId;
  nombre: string;
  descripcionCorta: string;
}

export const SECCIONES_REPORTE: readonly SeccionReporte[] = [
  {
    id: "DATOS_ESTUDIANTE",
    nombre: "Datos del estudiante",
    descripcionCorta: "Nombre, correo institucional y carrera.",
  },
  {
    id: "DESCRIPCION_CASO",
    nombre: "Descripción del caso",
    descripcionCorta: "Motivo registrado para el acompañamiento.",
  },
  {
    id: "MARCADORES_CRITICOS",
    nombre: "Marcadores críticos",
    descripcionCorta: "Señales agrupadas por categoría.",
  },
  {
    id: "OBSERVACIONES_ASESOR",
    nombre: "Observaciones del asesor",
    descripcionCorta: "Notas registradas durante el seguimiento.",
  },
  {
    id: "ESTADO_URGENCIA",
    nombre: "Estado y urgencia",
    descripcionCorta: "Situación actual y nivel de urgencia.",
  },
  {
    id: "FECHAS_CLAVE",
    nombre: "Fechas clave",
    descripcionCorta: "Creación del caso y último movimiento.",
  },
  {
    id: "LINEA_TIEMPO",
    nombre: "Línea de tiempo",
    descripcionCorta: "Eventos registrados en el caso.",
  },
];

export const SENSITIVE_DATA_WARNING =
  "Está a punto de generar un reporte que contiene información sensible de un estudiante. Verifique que las secciones seleccionadas sean las adecuadas y que el reporte se almacene en un lugar seguro.";
