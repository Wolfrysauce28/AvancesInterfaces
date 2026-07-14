import type { User, UserRole } from '../entities/User';

export interface UserRepository {
  login(email: string, role: UserRole): Promise<User>;
  getCurrentUser(): Promise<User | null>;
  logout(): Promise<void>;
}
