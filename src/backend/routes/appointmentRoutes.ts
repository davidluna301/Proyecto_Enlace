// src/backend/routes/appointmentRoutes.ts
import { Router } from 'express';
import { getAppointments, createAppointment } from '../controllers/appointmentController';

const router = Router();

// List appointments for the logged‑in advisor
router.get('/', getAppointments);

// Create a new appointment (student selects psychologist)
router.post('/', createAppointment);

export const createAppointmentRouter = () => router;
