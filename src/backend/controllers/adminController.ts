// src/backend/controllers/adminController.ts
import { Request, Response } from 'express';
import { createPsychologist, updatePsychologistPassword } from '../services/adminService';

export const addPsychologist = async (req: Request, res: Response) => {
  try {
    const result = await createPsychologist(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const resetPsychologistPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    const result = await updatePsychologistPassword(String(id), newPassword);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
