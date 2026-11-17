// src/shared/middlewares/errors.ts
import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).render('errors/404', { title: 'Página no encontrada' });
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  res.status(status).render('errors/500', { title: 'Error', message });
};
