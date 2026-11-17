// src/backend/routes/qrRoutes.ts
import { Router } from 'express';
import { getQRCode } from '../controllers/qrController';

const router = Router();

// Public endpoint: /qr/:studentId returns the SVG
router.get('/:studentId', getQRCode);

export const createQrRouter = () => router;
