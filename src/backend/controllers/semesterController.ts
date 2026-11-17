// src/backend/controllers/semesterController.ts
import { Request, Response } from 'express';
import { startSemester, endSemester } from '../services/SemesterService';

export const startSemesterHandler = async (req: Request, res: Response) => {
  try {
    const { semesterId, startDate, endDate } = req.body;
    if (!semesterId || !startDate || !endDate) {
      return res.status(400).json({ error: 'semesterId, startDate and endDate required' });
    }
    await startSemester({ semesterId, startDate, endDate });
    res.json({ message: 'Semester started' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const endSemesterHandler = async (req: Request, res: Response) => {
  try {
    const { semesterId } = req.body;
    if (!semesterId) {
      return res.status(400).json({ error: 'semesterId required' });
    }
    await endSemester(semesterId);
    res.json({ message: 'Semester ended' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
