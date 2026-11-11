export type UserRole = "ASESOR" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  aliases?: string[];
  role: UserRole;
  passwordHash: string;
}

export const mockUsers: User[] = [
  {
    id: "usr-asesor-01",
    name: "María Fernanda Ríos",
    email: "asesor@ucc.edu.co",
    aliases: ["asesor@enlace.edu.co"],
    role: "ASESOR",
    passwordHash:
      "$2b$12$gfwzr0WOtqk/UWFbG/cZC.IpKI1Yg7kx3ZkVv2yEEexB1Tl5xNfwq",
  },
  {
    id: "usr-admin-01",
    name: "Equipo ENLACE",
    email: "admin@enlace.edu.co",
    role: "ADMIN",
    passwordHash:
      "$2b$12$Lm8fcCuoxFNgWhgOjQ.Dx.M7WkQK.6Q7JKBQEc1JO9/ctFshz9FYS",
  },
];
