export type UserRole = "ADMIN" | "ASESOR";

export interface User {
  id: string;
  name: string;
  email: string;
  aliases?: string[];
  role: UserRole;
  passwordHash: string;
  specialty?: string;
  isActive: boolean;
  phone?: string;
  maxDailySlots?: number;
  createdAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: UserRole;
  password: string;
  specialty?: string;
  phone?: string;
}
