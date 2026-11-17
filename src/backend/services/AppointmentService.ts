import { randomBytes } from "node:crypto";
import { Appointment, AppointmentStatus, Modality, StudentBookingInput, TimeSlot, VALID_TIME_SLOTS } from "../domain/appointments";
import { getHoliday } from "../../shared/config/holidays";
import { COLOMBIAN_HOLIDAYS_2026 } from "../../shared/config/holidays";

export class AppointmentService {
  private appointments: Appointment[] = [];

  /** Validate that the requested slot is allowed and not a holiday */
  private async validate(input: StudentBookingInput): Promise<void> {
    // Time slot validation
    if (!VALID_TIME_SLOTS.includes(input.timeSlot as any)) {
      throw new Error(`Horario no permitido. Use uno de: ${VALID_TIME_SLOTS.join(", ")}`);
    }
    // Holiday check
    const holiday = getHoliday(input.date);
    if (holiday) {
      throw new Error(`No se pueden agendar citas el ${holiday.name} (${holiday.date})`);
    }
    // Advisor availability (simple example: 14:00‑16:00 only)
    const allowed = ["14:00", "14:30", "15:00", "15:30"];
    if (!allowed.includes(input.timeSlot)) {
      throw new Error("El asesor solo está disponible entre 14:00 y 16:00");
    }
  }

  async create(input: StudentBookingInput): Promise<Appointment> {
    await this.validate(input);
    const now = new Date().toISOString();
    const newAppt: Appointment = {
      id: `appt-${Date.now()}`,
      code: `ENL-${Math.floor(Math.random() * 10000)}`,
      semesterId: input.semesterId ?? "",
      studentId: input.studentId,
      studentName: input.studentName,
      studentEmail: input.studentEmail,
      studentPhone: input.studentPhone,
      program: input.program,
      semester: input.semester,
      advisorId: input.advisorId,
      date: input.date,
      timeSlot: input.timeSlot as TimeSlot,
      modality: input.modality,
      reason: input.reason,
      status: "SOLICITADA",
      createdAt: now,
      updatedAt: now,
    };
    this.appointments.push(newAppt);
    return newAppt;
  }

  async listByAdvisor(advisorId: string): Promise<Appointment[]> {
    return this.appointments.filter((a) => a.advisorId === advisorId);
  }

  async reschedule(id: string, newDate: string, newSlot: TimeSlot, reason: string): Promise<Appointment> {
    const appt = this.appointments.find((a) => a.id === id);
    if (!appt) throw new Error("Cita no encontrada");
    // Simple conflict check – no other appointment for same advisor at same time
    const conflict = this.appointments.find(
      (a) => a.advisorId === appt.advisorId && a.date === newDate && a.timeSlot === newSlot && a.id !== id,
    );
    if (conflict) throw new Error("Ya existe una cita en ese horario.");
    // Holiday validation
    const holiday = getHoliday(newDate);
    if (holiday) throw new Error(`No se pueden reagendar citas el ${holiday.name}`);

    appt.date = newDate;
    appt.timeSlot = newSlot;
    appt.status = "REAGENDADA";
    appt.rescheduleReason = reason;
    appt.updatedAt = new Date().toISOString();
    return appt;
  }

  async cancel(id: string): Promise<void> {
    const idx = this.appointments.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error("Cita no encontrada");
    this.appointments[idx].status = "CANCELADA";
    this.appointments[idx].updatedAt = new Date().toISOString();
  }
}

export const appointmentService = new AppointmentService();

export async function getAppointmentsForAdvisor(advisorId: string): Promise<Appointment[]> {
  return appointmentService.listByAdvisor(advisorId);
}

export async function createAppointment(data: any): Promise<Appointment> {
  return appointmentService.create({
    studentId: data.studentId || "1000",
    studentName: data.studentName || "Estudiante UCC",
    studentEmail: data.studentEmail || "estudiante@campusucc.edu.co",
    studentPhone: data.studentPhone || "3000000000",
    program: data.program || "Ingeniería",
    semester: data.semester || "5",
    advisorId: data.psychologistId || data.advisorId || "advisor-1",
    date: data.scheduledAt ? data.scheduledAt.split("T")[0] : "2026-03-02",
    timeSlot: "14:00",
    modality: data.modality || "virtual",
    reason: data.reason || "Acompañamiento",
    semesterId: data.semesterId,
  });
}

