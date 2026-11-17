// src/backend/controllers/appointmentController.ts
import { Request, Response } from 'express';
import { getAppointmentsForAdvisor, createAppointment as createAppointmentService } from '../services/AppointmentService';

// List appointments for the logged‑in psychologist (advisor)
export const getAppointments = async (req: Request, res: Response) => {
  try {
    const userId = req.session?.userId as string | undefined;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const appointments = await getAppointmentsForAdvisor(userId);
    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

// Create a new appointment (student selects psychologist)
export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { studentId, psychologistId, scheduledAt } = req.body;
    if (!studentId || !psychologistId || !scheduledAt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const result = await createAppointmentService({ studentId, psychologistId, scheduledAt });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
