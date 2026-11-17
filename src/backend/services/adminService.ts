// src/backend/services/adminService.ts
import { supabase } from '../../infra/supabase/client';
import { hashPassword } from '../../shared/utils/password';

export const createPsychologist = async (data: {
  email: string;
  name: string;
  password: string;
}) => {
  const hashed = await hashPassword(data.password);
  const { data: user, error } = await supabase.from('users').insert({
    email: data.email,
    name: data.name,
    password: hashed,
    role: 'PSYCHOLOGIST',
  });
  if (error) throw error;
  return user;
};

export const updatePsychologistPassword = async (id: string, newPassword: string) => {
  const hashed = await hashPassword(newPassword);
  const { data, error } = await supabase
    .from('users')
    .update({ password: hashed })
    .eq('id', id);
  if (error) throw error;
  return data;
};
