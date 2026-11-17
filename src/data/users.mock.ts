export type UserRole = "ASESOR" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  aliases?: string[];
  role: UserRole;
  passwordHash: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: UserRole;
  password: string;
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
    id: "usr-asesor-02",
    name: "Jhon Álvarez Mora",
    email: "jhon.alvarez@ucc.edu.co",
    role: "ASESOR",
    passwordHash:
      "$2b$12$gfwzr0WOtqk/UWFbG/cZC.IpKI1Yg7kx3ZkVv2yEEexB1Tl5xNfwq",
  },
  {
    id: "usr-asesor-03",
    name: "Patricia Morales Duarte",
    email: "p.morales@ucc.edu.co",
    role: "ASESOR",
    passwordHash:
      "$2b$12$gfwzr0WOtqk/UWFbG/cZC.IpKI1Yg7kx3ZkVv2yEEexB1Tl5xNfwq",
  },
  {
    id: "usr-asesor-04",
    name: "Carlos Eduardo Restrepo",
    email: "carlos.restrepo@ucc.edu.co",
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
