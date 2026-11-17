// src/backend/routes/semesterRoutes.ts
import { Router } from 'express';
import { startSemesterHandler, endSemesterHandler } from '../controllers/semesterController';

const router = Router();

router.post('/start', startSemesterHandler);
router.post('/end', endSemesterHandler);

export const createSemesterRouter = () => router;
