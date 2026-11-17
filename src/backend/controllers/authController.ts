// src/backend/controllers/authController.ts
import { Request, Response } from 'express';
import { supabase } from '../../infra/supabase/client';
import { env } from '../../shared/config/env';
import { comparePassword } from '../../shared/utils/password';

// Simple email/password login using Supabase Auth
export const loginHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Use Supabase to fetch the user record (password stored hashed in DB)
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Store minimal user info in session
    (req.session as any).userId = user.id;
    (req.session as any).role = user.role;
    res.json({ message: 'Authenticated', user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const logoutHandler = (req: Request, res: Response) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('enlace.sid');
    res.json({ message: 'Logged out' });
  });
};
