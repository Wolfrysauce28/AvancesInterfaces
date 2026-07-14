import type { UserRepository } from '../../domain/repositories/UserRepository';
import type { User, UserRole } from '../../domain/entities/User';

export class LocalStorageUserRepository implements UserRepository {
  async login(email: string, password?: string, role: UserRole = 'client'): Promise<User> {
    const user: User = {
      id: role === 'admin' ? 'user-admin-1' : 'user-client-1',
      name: role === 'admin' ? 'Admin - El Trigo' : 'Juan Pérez',
      email,
      role,
      avatarUrl: role === 'admin' 
        ? 'https://i.pravatar.cc/100?img=33' 
        : 'https://i.pravatar.cc/100?img=32',
      storeId: role === 'admin' ? 'store-el-trigo' : undefined
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('ceromerma_user', JSON.stringify(user));
    }
    return user;
  }

  async getCurrentUser(): Promise<User | null> {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem('ceromerma_user');
    if (!data) return null;
    try {
      return JSON.parse(data) as User;
    } catch {
      return null;
    }
  }

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ceromerma_user');
    }
  }
}
