// src/backend/routes/adminRoutes.ts
import { Router } from 'express';
import { addPsychologist, resetPsychologistPassword } from '../controllers/adminController';

const router = Router();

// Create a new psychologist (admin only)
router.post('/psychologists', addPsychologist);

// Reset password for a psychologist
router.patch('/psychologists/:id/password', resetPsychologistPassword);

export const createAdminRouter = () => router;
