import bcrypt from "bcrypt";
import { mockUsers, type CreateUserInput, type User } from "../../data/users.mock";

export class UserService {
  private users: User[] = [...mockUsers];

  async createUser(input: CreateUserInput): Promise<User> {
    const passwordHash = await bcrypt.hash(input.password, 12);
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: input.name,
      email: input.email,
      role: input.role,
      passwordHash,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new Error("User not found");
    user.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  async list(): Promise<User[]> {
    return this.users;
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.find((u) => u.id === id);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const normalized = email.trim().toLowerCase();
    return this.users.find(
      (u) => u.email.toLowerCase() === normalized || u.aliases?.some((a) => a.toLowerCase() === normalized),
    );
  }
}
