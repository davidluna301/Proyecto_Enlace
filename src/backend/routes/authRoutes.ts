// src/backend/routes/authRoutes.ts
import { Router } from 'express';
import { loginHandler, logoutHandler } from '../controllers/authController';

const router = Router();

router.post('/login', loginHandler);
router.post('/logout', logoutHandler);

export const createAuthRouter = () => router;
