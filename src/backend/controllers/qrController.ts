// src/backend/controllers/qrController.ts
import { Request, Response } from 'express';
import { generateQR } from '../../shared/utils/qr-generator';

// Returns an SVG QR code for a given student identifier
export const getQRCode = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    if (!studentId) {
      return res.status(400).json({ error: 'studentId is required' });
    }
    const svg = generateQR(String(studentId));
    res.type('image/svg+xml');
    res.send(svg);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
