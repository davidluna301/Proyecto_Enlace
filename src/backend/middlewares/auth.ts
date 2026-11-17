// src/backend/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../infra/supabase/client';

// Attach the current user (if any) to res.locals for templates and downstream handlers
export const attachCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.userId as string | undefined;
    if (userId) {
      const { data: user, error } = await supabase.from('users').select('*').eq('id', userId).single();
      if (!error && user) {
        res.locals.currentUser = user;
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};

// Require authentication for protected routes
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.userId) {
    return next();
  }
  res.redirect('/login');
};
