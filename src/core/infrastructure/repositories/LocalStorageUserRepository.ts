import type { UserRepository } from '../../domain/repositories/UserRepository';
import type { User, UserRole } from '../../domain/entities/User';
import { isBrowser } from '../helpers/env';

export class LocalStorageUserRepository implements UserRepository {
  async login(email: string, _password?: string, role: UserRole = 'client'): Promise<User> {
    const defaultName = email.split('@')[0];
    const formattedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
    const user: User = {
      id: role === 'admin' ? 'user-admin-1' : 'user-client-1',
      name: role === 'admin' ? 'Admin - El Trigo' : formattedName,
      email,
      role,
      avatarUrl: role === 'admin'
        ? 'https://i.pravatar.cc/100?img=33'
        : `https://api.dicebear.com/7.x/bottts/svg?seed=${defaultName}`,
      storeId: role === 'admin' ? 'store-el-trigo' : undefined
    };

    if (isBrowser()) {
      localStorage.setItem('foodsave_user', JSON.stringify(user));
    }
    return user;
  }

  async getCurrentUser(): Promise<User | null> {
    if (!isBrowser()) return null;
    const data = localStorage.getItem('foodsave_user');
    if (!data) return null;
    try {
      return JSON.parse(data) as User;
    } catch {
      return null;
    }
  }

  async loginWithGoogle(): Promise<User> {
    const user: User = {
      id: 'user-google-1',
      name: 'Google User',
      email: 'google@example.com',
      role: 'client',
      avatarUrl: 'https://i.pravatar.cc/100?img=11',
    };

    if (isBrowser()) {
      localStorage.setItem('foodsave_user', JSON.stringify(user));
    }
    return user;
  }

  async logout(): Promise<void> {
    if (isBrowser()) {
      localStorage.removeItem('foodsave_user');
    }
  }

  async updateProfile(userId: string, updates: { name?: string; avatarUrl?: string }): Promise<User> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) throw new Error('No hay una sesión activa');

    const updatedUser = {
      ...currentUser,
      ...updates
    };

    if (isBrowser()) {
      localStorage.setItem('foodsave_user', JSON.stringify(updatedUser));
    }
    return updatedUser;
  }
}
