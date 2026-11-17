import bcrypt from "bcrypt";
import { mockUsers, type User } from "../../data/users.mock";

const invalidPasswordHash =
  "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

export class AuthService {
  async authenticate(email: string, password: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = mockUsers.find(
      (candidate) =>
        candidate.email.toLowerCase() === normalizedEmail ||
        candidate.aliases?.some(
          (alias) => alias.toLowerCase() === normalizedEmail,
        ),
    );
    const passwordMatches = await bcrypt.compare(
      password,
      user?.passwordHash ?? invalidPasswordHash,
    );
    return user && passwordMatches ? user : null;
  }

  getUserById(id: string): User | null {
    return mockUsers.find((user) => user.id === id) ?? null;
  }

  listPublicUsers(): Array<Pick<User, "name" | "email" | "role">> {
    return mockUsers.map(({ name, email, role }) => ({ name, email, role }));
  }
}
