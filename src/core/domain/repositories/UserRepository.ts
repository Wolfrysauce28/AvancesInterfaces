import type { User, UserRole } from '../entities/User';

export interface UserRepository {
  login(email: string, password?: string, role?: UserRole): Promise<User>;
  loginWithGoogle(): Promise<User>;
  getCurrentUser(): Promise<User | null>;
  logout(): Promise<void>;
  updateProfile(userId: string, updates: { name?: string; avatarUrl?: string }): Promise<User>;
}
