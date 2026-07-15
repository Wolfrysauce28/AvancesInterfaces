import type { UserRepository } from '../../domain/repositories/UserRepository';
import type { User } from '../../domain/entities/User';

export class LoginWithGoogle {
  constructor(private userRepository: UserRepository) {}

  async execute(): Promise<User> {
    return this.userRepository.loginWithGoogle();
  }
}
