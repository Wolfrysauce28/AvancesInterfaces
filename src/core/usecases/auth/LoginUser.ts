import type { UserRepository } from '../../domain/repositories/UserRepository';
import type { User, UserRole } from '../../domain/entities/User';

export class LoginUser {
  constructor(private userRepository: UserRepository) {}

  async execute(email: string, role: UserRole): Promise<User> {
    if (!email) {
      throw new Error('El correo electrónico es requerido.');
    }
    return this.userRepository.login(email, role);
  }
}
